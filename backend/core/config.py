import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "Legal Helper"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")

    # Database
    DB_HOST: str = Field(..., env="DB_HOST")
    DB_PORT: int = Field(3306, env="DB_PORT")
    DB_NAME: str = Field(..., env="DB_NAME")
    DB_USER: str = Field(..., env="DB_USER")
    DB_PASS: str = Field(..., env="DB_PASS")

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Gemini
    GEMINI_API_KEY: str = Field(..., env="GEMINI_API_KEY")

    @property
    def GEMINI_CONFIG(self) -> dict:
        return {
            "api_key": self.GEMINI_API_KEY,
            "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            "headers": {"Content-Type": "application/json"}
        }

    class Config:
        env_file = ".env"  # auto-load từ .env nếu chạy local

settings = Settings()
