"""
AIGC engine service layer - OpenRouter unified API, model fallback, health check
"""
import json
import logging
import time
from typing import Optional, Any
from httpx import AsyncClient, Timeout
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AIGCPlatform, TokenUsage
from app.config import settings

logger = logging.getLogger(__name__)


class AIGCService:
    """AIGC engine service - OpenRouter unified gateway with model fallback"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncClient(timeout=Timeout(120.0))

    async def get_platform(self, platform_code: str) -> Optional[AIGCPlatform]:
        """Get AIGC platform configuration"""
        result = await self.db.execute(
            select(AIGCPlatform).where(AIGCPlatform.code == platform_code)
        )
        return result.scalar_one_or_none()

    async def get_enabled_platforms(self) -> list[AIGCPlatform]:
        """Get enabled platforms (sorted by priority)"""
        result = await self.db.execute(
            select(AIGCPlatform)
            .where(AIGCPlatform.status == "enabled")
            .order_by(AIGCPlatform.priority, AIGCPlatform.response_avg_ms)
        )
        return result.scalars().all()

    async def chat(
        self,
        platform_code: str,
        messages: list[dict],
        model: Optional[str] = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Call AIGC chat via OpenRouter unified gateway

        Args:
            platform_code: OpenRouter model identifier (e.g. "openai/gpt-4o")
            messages: [{"role": "user", "content": "..."}]
            model: Override model name (optional)
        """
        platform = await self.get_platform(platform_code)
        api_key = settings.OPENROUTER_API_KEY
        api_base = settings.OPENROUTER_API_BASE
        model_name = model or platform_code

        start_time = time.time()
        try:
            response = await self._call_openrouter(
                api_base=api_base,
                api_key=str(api_key) if api_key else "",
                model=model_name,
                messages=messages,
                **kwargs,
            )

            duration_ms = (time.time() - start_time) * 1000

            # Update health status
            if platform:
                await self._update_health(platform.id, duration_ms, success=True)
                # Record token usage
                await self._record_usage(
                    platform_id=platform.id,
                    model=model_name,
                    input_tokens=response.get("usage", {}).get("prompt_tokens", 0),
                    output_tokens=response.get("usage", {}).get(
                        "completion_tokens", 0
                    ),
                    duration_seconds=duration_ms / 1000,
                )

            return response

        except Exception as e:
            logger.error(f"OpenRouter call failed for {platform_code}: {str(e)}")
            if platform:
                await self._update_health(platform.id, 0, success=False)
            # Fallback to next model
            return await self.chat_with_fallback(
                messages, model=model, exclude=platform_code, **kwargs
            )

    async def chat_with_fallback(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        exclude: Optional[str] = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Fallback - try other models via OpenRouter"""
        for model_id in settings.OPENROUTER_MODELS:
            if exclude and model_id == exclude:
                continue
            try:
                return await self.chat(model_id, messages, model=model_id, **kwargs)
            except Exception:
                continue

        raise Exception("All OpenRouter models are unavailable")

    async def _call_openrouter(
        self,
        api_base: str,
        api_key: str,
        model: str,
        messages: list[dict],
        **kwargs,
    ) -> dict:
        """Actual OpenRouter API call"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": settings.OPENROUTER_REFERER,
            "X-Title": settings.APP_NAME,
        }

        if "provider" in kwargs:
            headers["X-OpenRouter-Provider"] = kwargs.pop("provider")

        payload = {
            "model": model,
            "messages": messages,
            **kwargs,
        }

        url = f"{api_base}/chat/completions"

        response = await self.client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

    async def _update_health(
        self, platform_id: str, response_ms: float, success: bool
    ):
        """Update platform health status"""
        platform = await self.db.get(AIGCPlatform, platform_id)
        if not platform:
            return

        update_data = {
            "last_health_check": time.strftime("%Y-%m-%d %H:%M:%S"),
        }

        if success:
            # Smooth average response time
            update_data["response_avg_ms"] = (
                platform.response_avg_ms * 0.7 + response_ms * 0.3
            )
            update_data["error_count"] = 0
        else:
            update_data["error_count"] = platform.error_count + 1
            if platform.error_count >= 3:
                update_data["status"] = "error"

        await self.db.execute(
            update(AIGCPlatform)
            .where(AIGCPlatform.id == platform_id)
            .values(**update_data)
        )
        await self.db.commit()

    async def _record_usage(
        self,
        platform_id: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        duration_seconds: float,
    ):
        """Record token usage"""
        usage = TokenUsage(
            aigc_platform_id=platform_id,
            model=model,
            date=time.strftime("%Y-%m-%d"),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            duration_seconds=duration_seconds,
            cost=(input_tokens + output_tokens) * 0.000002,  # rough estimate
        )
        self.db.add(usage)
        await self.db.commit()

    async def health_check(self, model_id: str) -> dict:
        """Single model health check via OpenRouter"""
        try:
            response = await self._call_openrouter(
                api_base=settings.OPENROUTER_API_BASE,
                api_key=str(settings.OPENROUTER_API_KEY or ""),
                model=model_id,
                messages=[{"role": "user", "content": "Reply 'ok' if connection is normal"}],
                max_tokens=10,
            )
            return {
                "model": model_id,
                "status": "healthy",
                "response": response.get("choices", [{}])[0]
                .get("message", {})
                .get("content", ""),
            }
        except Exception as e:
            return {"model": model_id, "status": "unhealthy", "error": str(e)}

    async def health_check_all(self) -> list[dict]:
        """Check health of all configured models"""
        results = []
        for model_id in settings.OPENROUTER_MODELS:
            result = await self.health_check(model_id)
            results.append(result)
        return results
