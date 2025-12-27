from typing import List
from urllib.parse import quote_plus
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 数据库连接配置
    DB_DIALECT: str = "sqlite"
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
        if self.DB_DIALECT == "sqlite":
            # SQLite 使用不同的连接字符串格式
            return f"sqlite+aiosqlite:///{self.DB_PATH}"
        else:
            # MySQL 或其他数据库类型
            encoded_pass = quote_plus(self.DB_PASS)
            return f"{self.DB_DIALECT}+aiomysql://{self.DB_USER}:{encoded_pass}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()
