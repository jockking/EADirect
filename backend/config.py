from pydantic_settings import BaseSettings
from typing import List
import json
import os
from pathlib import Path


class Settings(BaseSettings):
    repo_path: str = "./data/architecture-repo"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database settings
    # These can be set via environment variables: DATABASE_HOST, DATABASE_PORT, etc.
    # Or loaded from database.config.json file
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "enterprise_architecture"
    database_user: str = "postgres"
    database_password: str = ""

    # Security settings
    secret_key: str = "your-secret-key-change-in-production"
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False

        # Map old property names to environment variable names
        fields = {
            'database_host': {'env': 'DATABASE_HOST'},
            'database_port': {'env': 'DATABASE_PORT'},
            'database_name': {'env': 'DATABASE_NAME'},
            'database_user': {'env': 'DATABASE_USER'},
            'database_password': {'env': 'DATABASE_PASSWORD'},
            'secret_key': {'env': 'SECRET_KEY'},
            'allowed_origins': {'env': 'ALLOWED_ORIGINS'}
        }

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
