# GO2 TopcentralGEO.com — 竞品分析 & 今日执行报告
## 2026-06-20

### 已确认修复的问题
1. ✅ /privacy/ → 200 OK (GDPR/CCPA合规页面)
2. ✅ /terms/ → 200 OK (新加坡法律/SIAC仲裁)
3. ✅ Sitemap → 29条URL全部带尾斜杠
4. ✅ 22篇文章重建到articles.js (DB驱动)
5. ✅ evidence/ 目录已创建于服务器
6. ✅ 后端(backend)和PostgreSQL运行正常

### DB真实数据(与前端不一致)
- 8篇A档(12,244-21,450词) — 前端只显示摘要
- 4篇B档(1,513-2,228词)
- 10篇C档(1,582-2,328词)
- 关键词120个(14分类)

### 竞品数据
| 竞品 | GEO率 | 品牌 | 趋势 |
| BASF | 69.6% | ChemCycling | ↑ |
| SABIC | 65.0% | TRUCIRCLE | ↑↑ |
| 金发科技 | 61.7% | 金发环保 | ↑↑ |
| LyondellBasell | 55.2% | Circulen | ↑ |
| Dow | 52.8% | REVOLOOP | → |
| Topcentral | 39.6%(SEO站) | | → |

### 新关键词50个(6分类)
详见关键词设计文件

### 新文章50篇(A5+B25+C20)
按A:B:C=10:50:40比例设计

### 今日服务器操作
1. sitemap.xml部署(带尾斜杠) ✅
2. privacy/terms静态页面部署 ✅
3. nginx配置更新(privacy/terms直连) ✅
4. rebuild_data.py执行  ✅
5. npm run build + docker cp ✅
6. evidence目录创建 ✅
7. 所有验证通过(all 200 OK) ✅
