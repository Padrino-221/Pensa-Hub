from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter(tags=["Robots"])

ROBOTS_TXT = (
    "User-agent: *\n"
    "Allow: /\n"
    "\n"
    "Sitemap: https://pensa-hub.vercel.app/sitemap.xml\n"
)


@router.get("/robots.txt", include_in_schema=False)
def robots_txt():
    return Response(content=ROBOTS_TXT, media_type="text/plain")
