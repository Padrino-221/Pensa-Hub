from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:1234567890@localhost:5432/puhub"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    COOKIE_NAME: str = "puhub_token"
    COOKIE_SECURE: bool = False
    # "lax" for same-site deployments; "none" (with COOKIE_SECURE=true) when the
    # frontend and API live on different origins (e.g. Vercel + separate API).
    COOKIE_SAMESITE: str = "lax"
    # Comma-separated list of frontend origins allowed to call the API.
    # Add your deployed Vercel URL here (e.g. https://puhub.vercel.app).
    CORS_ORIGINS: str = "http://localhost:5173"

    # Cloudinary (image hosting for uploaded site images). Empty = fall back to local storage.
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()