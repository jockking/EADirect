from pydantic_settings import BaseSettings
from typing import List
import json
from pathlib import Path


class Settings(BaseSettings):
    repo_path: str = "./data/architecture-repo"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database settings (loaded from database.config.json)
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "enterprise_architecture"
    db_user: str = "postgres"
    db_password: str = ""

    class Config:
        env_file = ".env"

    def load_database_config(self):
        """Load database configuration from database.config.json"""
        config_path = Path(__file__).parent / "database.config.json"
        if config_path.exists():
            with open(config_path, 'r') as f:
                db_config = json.load(f)['database']
                self.db_host = db_config.get('host', self.db_host)
                self.db_port = db_config.get('port', self.db_port)
                self.db_name = db_config.get('database', self.db_name)
                self.db_user = db_config.get('user', self.db_user)
                self.db_password = db_config.get('password', self.db_password)
        return self

    @property
    def database_url(self) -> str:
        """Generate SQLAlchemy database URL"""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings().load_database_config()
