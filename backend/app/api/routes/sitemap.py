import json
from datetime import date
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import SiteSetting

router = APIRouter(tags=["Sitemap"])

BASE_URL = "https://pensa-hub.vercel.app"

# (path, changefreq, priority)
STATIC_PAGES = [
    ("/", "weekly", "1.0"),
    ("/about", "monthly", "0.8"),
    ("/leadership", "monthly", "0.7"),
    ("/ministries", "monthly", "0.8"),
    ("/community/pensice", "monthly", "0.6"),
    ("/community/plc", "monthly", "0.6"),
    ("/community/cenacle", "monthly", "0.6"),
    ("/community/gallery", "weekly", "0.6"),
    ("/community/news", "weekly", "0.7"),
    ("/resources", "monthly", "0.7"),
    ("/contact", "monthly", "0.7"),
]


def _lastmod(value) -> str:
    """Format a datetime as YYYY-MM-DD, falling back to today."""
    if value is not None:
        try:
            return value.date().isoformat()
        except AttributeError:
            pass
    return date.today().isoformat()


@router.get("/sitemap.xml", include_in_schema=False)
def sitemap_xml(db: Session = Depends(get_db)):
    """Generate sitemap.xml from the static page list plus every news article
    currently in the database, so new articles are indexed automatically."""
    entries: list[tuple[str, str, str, str]] = []  # (path, freq, priority, lastmod)
    today = date.today().isoformat()

    # News articles are dynamic — their slugs live in the `news` settings section.
    news = db.query(SiteSetting).filter(SiteSetting.section == "news").first()
    news_lastmod = _lastmod(news.updated_at if news else None)
    if news:
        try:
            value = json.loads(news.value)
        except (TypeError, ValueError):
            value = {}
        for article in value.get("articles", []) or []:
            slug = article.get("slug") if isinstance(article, dict) else None
            if slug:
                entries.append((f"/community/news/{slug}", "monthly", "0.6", news_lastmod))

    # Static pages use each section's last update where available.
    sections = {s.section: s for s in db.query(SiteSetting).all()}
    section_for_path = {
        "/": "hero",
        "/about": "about",
        "/leadership": "leadership",
        "/ministries": "ministries",
        "/community/pensice": "pensice",
        "/community/plc": "plc",
        "/community/cenacle": "cenacle",
        "/community/gallery": "gallery",
        "/community/news": "news",
        "/resources": "resources",
        "/contact": "contact",
    }
    for path, freq, priority in STATIC_PAGES:
        section = sections.get(section_for_path[path])
        lastmod = _lastmod(section.updated_at if section else None)
        entries.append((path, freq, priority, lastmod))

    urls = "".join(
        "  <url>\n"
        f"    <loc>{BASE_URL}{escape(path)}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{freq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>\n"
        for path, freq, priority, lastmod in entries
    )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}"
        "</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml")
