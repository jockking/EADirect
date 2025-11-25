"""Database connection and session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import settings
from typing import Generator

# Create database engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verify connections before using them
    echo=False  # Set to True to see SQL queries in logs
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Use with FastAPI Depends() to inject database session into endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from db_models import Base
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            print(f"Connected to: {settings.database_url.split('@')[1]}")  # Hide password
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
