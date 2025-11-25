"""User service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from passlib.context import CryptContext
from datetime import datetime
from db_models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for user database operations"""

    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_all(self, db: Session) -> List[User]:
        """Get all users"""
        return db.query(User).all()

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, email: str, name: str, password: str,
               role: str = "user", profile_image_url: Optional[str] = None) -> User:
        """Create a new user"""
        hashed_password = self.hash_password(password)
        user = User(
            email=email,
            name=name,
            hashed_password=hashed_password,
            role=role,
            status="active",
            auth_provider="local",
            profile_image_url=profile_image_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update(self, db: Session, user_id: int, **kwargs) -> Optional[User]:
        """Update user"""
        user = self.get_by_id(db, user_id)
        if not user:
            return None

        # Hash password if provided
        if 'password' in kwargs and kwargs['password']:
            kwargs['hashed_password'] = self.hash_password(kwargs['password'])
            del kwargs['password']

        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)

        db.commit()
        db.refresh(user)
        return user

    def delete(self, db: Session, user_id: int) -> bool:
        """Delete user"""
        user = self.get_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_by_email(db, email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        return user


user_service = UserService()
