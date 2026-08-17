from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import RoleEnum, SiteSetting
from app.schemas import SiteSettingOut, SiteSettingUpdate
from app.services import audit

router = APIRouter(prefix="/settings", tags=["Settings"])
public_router = APIRouter(prefix="/public/settings", tags=["Public Settings"])

# Per the access matrix: only IT Head and Super Admin manage site settings.
SETTINGS_ROLES = {RoleEnum.it_head, RoleEnum.super_admin}


@router.get("", response_model=list[SiteSettingOut])
def list_settings(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*SETTINGS_ROLES)),
):
    """Get all settings - accessible by IT Head and Super Admin"""
    return db.query(SiteSetting).all()


@public_router.get("", response_model=list[SiteSettingOut])
def list_public_settings(db: Session = Depends(get_db)):
    """Get all settings - public read for the website frontend."""
    return db.query(SiteSetting).all()


@public_router.get("/{section}", response_model=SiteSettingOut)
def get_public_setting(section: str, db: Session = Depends(get_db)):
    """Get one setting section - public read for the website frontend."""
    setting = db.query(SiteSetting).filter(SiteSetting.section == section).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting section not found")
    return setting


@router.get("/{section}", response_model=SiteSettingOut)
def get_setting(
    section: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*SETTINGS_ROLES)),
):
    """Get one setting section - accessible by IT Head and Super Admin"""
    setting = db.query(SiteSetting).filter(SiteSetting.section == section).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting section not found")
    return setting


@router.put("/{section}", response_model=SiteSettingOut)
def upsert_setting(
    section: str,
    data: SiteSettingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*SETTINGS_ROLES)),
):
    """Upsert a setting section - accessible by IT Head and Super Admin"""
    setting = db.query(SiteSetting).filter(SiteSetting.section == section).first()
    if setting:
        setting.value = data.value
        setting.updated_by = current_user.id
    else:
        setting = SiteSetting(
            section=section,
            value=data.value,
            updated_by=current_user.id,
        )
        db.add(setting)
    audit.log(db, current_user.id, "settings.updated", "settings", section)
    db.commit()
    db.refresh(setting)
    return setting