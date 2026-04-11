from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./simplerisk.db"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
