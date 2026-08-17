import io
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import require_roles
from app.core.config import settings
from app.models import RoleEnum

router = APIRouter(prefix="/uploads", tags=["Uploads"])

# Only IT Head and Super Admin can upload files (they manage site content).
UPLOAD_ROLES = {RoleEnum.it_head, RoleEnum.super_admin}

IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
}
DOCUMENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
}
ALLOWED_TYPES = IMAGE_TYPES | DOCUMENT_TYPES
IMAGE_MAX_SIZE = 5 * 1024 * 1024  # 5 MB
DOCUMENT_MAX_SIZE = 20 * 1024 * 1024  # 20 MB

# Raw-file extensions by MIME type, so Cloudinary URLs keep a real extension
# (raw delivery URLs do not get one appended automatically).
DOC_EXT_BY_TYPE = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "text/plain": ".txt",
}

# Local fallback target (used only when Cloudinary isn't configured): save into
# the frontend's public folder so files are served at /photos/uploads/... .
REPO_ROOT = Path(__file__).resolve().parents[3].parent
UPLOAD_DIR = REPO_ROOT / "frontend" / "public" / "photos" / "uploads"

cloudinary_configured = bool(
    settings.CLOUDINARY_CLOUD_NAME
    and settings.CLOUDINARY_API_KEY
    and settings.CLOUDINARY_API_SECRET
)
if cloudinary_configured:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    _=Depends(require_roles(*UPLOAD_ROLES)),
):
    """Upload an image or document and return its public URL.

    Images and documents are hosted on Cloudinary (returns the
    res.cloudinary.com URL). Falls back to saving locally (/photos/uploads/...)
    if Cloudinary is not configured in the backend .env.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Upload an image (JPEG, PNG, WebP, GIF, SVG) or a document (PDF, Word, PowerPoint, Excel, text).",
        )
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    is_image = file.content_type in IMAGE_TYPES
    max_size = IMAGE_MAX_SIZE if is_image else DOCUMENT_MAX_SIZE
    if len(contents) > max_size:
        limit_mb = (IMAGE_MAX_SIZE if is_image else DOCUMENT_MAX_SIZE) // (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"File exceeds {limit_mb} MB limit")

    if cloudinary_configured:
        try:
            if is_image:
                result = cloudinary.uploader.upload(
                    io.BytesIO(contents),
                    resource_type="image",
                    folder="puhub",
                    unique_filename=True,
                    overwrite=False,
                )
            else:
                # Keep the extension in the public_id so downloads keep it too.
                ext = DOC_EXT_BY_TYPE.get(file.content_type) or Path(file.filename or "").suffix.lower() or ".pdf"
                result = cloudinary.uploader.upload(
                    io.BytesIO(contents),
                    resource_type="raw",
                    folder="puhub",
                    public_id=f"{uuid.uuid4().hex}{ext}",
                    overwrite=False,
                )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Upload failed: {e}")
        return {"url": result["secure_url"], "size": result.get("bytes") or len(contents)}

    # Local fallback (no Cloudinary credentials in .env)
    ext = Path(file.filename or "").suffix.lower() or (".png" if is_image else ".pdf")
    name = f"{uuid.uuid4().hex}{ext}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = UPLOAD_DIR / name
    dest.write_bytes(contents)
    return {"url": f"/photos/uploads/{name}", "size": len(contents)}
