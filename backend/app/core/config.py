from typing import List
from urllib.parse import quote_plus
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 数据库连接配置
    DB_DIALECT: str = "mysql"
    DB_PATH: str = "./database.sqlite"
    DB_LOGGING: bool = True
    
    # MySQL 特定配置
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str = "research_db"
    DB_USER: str = "root"
    DB_PASS: str = ""
    
    # 从环境变量构建数据库URL
    @property
    def DATABASE_URL(self) -> str:
        encoded_pass = quote_plus(self.DB_PASS)
        base = f"{self.DB_DIALECT}+aiomysql://{self.DB_USER}:{encoded_pass}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return f"{base}?charset=utf8mb4"
    
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "http://127.0.0.1:3001"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()
