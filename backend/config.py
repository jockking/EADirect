from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List
import json
import os
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

    repo_path: str = "./data/architecture-repo"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database settings
    # These can be set via environment variables: DATABASE_HOST, DATABASE_PORT, etc.
    # Or loaded from database.config.json file
    database_host: str = Field(default="localhost", alias="DATABASE_HOST")
    database_port: int = Field(default=5432, alias="DATABASE_PORT")
    database_name: str = Field(default="enterprise_architecture", alias="DATABASE_NAME")
    database_user: str = Field(default="postgres", alias="DATABASE_USER")
    database_password: str = Field(default="", alias="DATABASE_PASSWORD")

    # Security settings
    secret_key: str = Field(default="your-secret-key-change-in-production", alias="SECRET_KEY")
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173", alias="ALLOWED_ORIGINS")

    def load_database_config(self):
        """Load database configuration from database.config.json (fallback if env vars not set)"""
        config_path = Path(__file__).parent / "database.config.json"
        if config_path.exists() and not os.getenv('DATABASE_HOST'):
            # Only load from file if environment variables are not set
            with open(config_path, 'r') as f:
                db_config = json.load(f)['database']
                self.database_host = db_config.get('host', self.database_host)
                self.database_port = db_config.get('port', self.database_port)
                self.database_name = db_config.get('database', self.database_name)
                self.database_user = db_config.get('user', self.database_user)
                self.database_password = db_config.get('password', self.database_password)
        return self

    @property
    def database_url(self) -> str:
        """Generate SQLAlchemy database URL"""
        return f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"

    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(',')]
        return self.allowed_origins


settings = Settings().load_database_config()
