"""Contact Form API - Handle visitor contact submissions"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, BackgroundTasks
import httpx
import os

router = APIRouter(prefix="/contact", tags=["contact"])

# In-memory storage (replace with DB table in production)
contact_submissions = []

SALES_EMAIL = os.getenv("SALES_EMAIL", "admin@topcentral.cn")


class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    message: str


async def send_email_notification(contact: ContactForm):
    """Send email notification to sales team"""
    try:
        # Using a simple HTTP email service or SMTP
        # For now, log the notification
        print(f"[EMAIL] New contact from {contact.name} <{contact.email}>")
        print(f"[EMAIL] Company: {contact.company or 'N/A'}")
        print(f"[EMAIL] Message: {contact.message}")
        print(f"[EMAIL] Would send to: {SALES_EMAIL}")
        # TODO: Integrate with SendGrid/AWS SES/阿里云邮件推送
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")


@router.post("/")
async def submit_contact(
    form: ContactForm,
    background_tasks: BackgroundTasks
):
    """Submit contact form"""
    submission = {
        "id": len(contact_submissions) + 1,
        "name": form.name,
        "email": form.email,
        "company": form.company,
        "message": form.message,
        "created_at": datetime.utcnow().isoformat(),
        "status": "new"
    }
    contact_submissions.append(submission)
    
    # Send email notification in background
    background_tasks.add_task(send_email_notification, form)
    
    return {
        "success": True,
        "message": "Contact form submitted successfully",
        "id": submission["id"]
    }


@router.get("/")
async def list_contacts():
    """List all contact submissions (admin only)"""
    return {
        "total": len(contact_submissions),
        "submissions": contact_submissions
    }
