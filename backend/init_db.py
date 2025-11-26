"""Database initialization script"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import settings
from database import init_db, test_connection, engine
from db_models import Base, User, UserRoleEnum, UserStatusEnum
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_database():
    """Create the database if it doesn't exist"""
    print(f"Checking if database '{settings.database_name}' exists...")

    try:
        # Connect to postgres database to create our database
        conn = psycopg2.connect(
            host=settings.database_host,
            port=settings.database_port,
            user=settings.database_user,
            password=settings.database_password,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (settings.database_name,)
        )
        exists = cursor.fetchone()

        if not exists:
            print(f"Creating database '{settings.database_name}'...")
            cursor.execute(f'CREATE DATABASE {settings.database_name}')
            print(f"✅ Database '{settings.database_name}' created successfully!")
        else:
            print(f"✅ Database '{settings.database_name}' already exists.")

        cursor.close()
        conn.close()
        return True

    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False


def create_default_users():
    """Create default admin and user accounts"""
    print("Creating default users...")

    with Session(engine) as session:
        # Check if users already exist
        existing_users = session.query(User).count()
        if existing_users > 0:
            print(f"✅ Users already exist ({existing_users} users found). Skipping user creation.")
            return

        # Create admin user
        admin_user = User(
            email="admin@ea.com",
            name="Admin User",
            hashed_password=pwd_context.hash("admin"),
            role=UserRoleEnum.ADMIN,
            status=UserStatusEnum.ACTIVE,
            auth_provider="local",
            last_login=datetime.utcnow()
        )
        session.add(admin_user)

        # Create regular user
        regular_user = User(
            email="user@ea.com",
            name="Regular User",
            hashed_password=pwd_context.hash("user"),
            role=UserRoleEnum.USER,
            status=UserStatusEnum.ACTIVE,
            auth_provider="local",
            last_login=datetime.utcnow()
        )
        session.add(regular_user)

        # Create John Doe user
        john_user = User(
            email="john.doe@ea.com",
            name="John Doe",
            hashed_password=pwd_context.hash("password"),
            role=UserRoleEnum.USER,
            status=UserStatusEnum.ACTIVE,
            auth_provider="local"
        )
        session.add(john_user)

        session.commit()
        print("✅ Default users created:")
        print("   - admin@ea.com / admin (Admin)")
        print("   - user@ea.com / user (User)")
        print("   - john.doe@ea.com / password (User)")


def main():
    """Main initialization function"""
    print("=" * 60)
    print("Enterprise Architecture Database Initialization")
    print("=" * 60)
    print()

    # Step 1: Create database
    if not create_database():
        print("Failed to create database. Exiting.")
        return

    print()

    # Step 2: Test connection
    print("Testing database connection...")
    if not test_connection():
        print("Database connection failed. Exiting.")
        return

    print()

    # Step 3: Create tables
    print("Creating database tables...")
    try:
        init_db()
        print("✅ All tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return

    print()

    # Step 4: Create default users
    try:
        create_default_users()
    except Exception as e:
        print(f"❌ Error creating default users: {e}")
        return

    print()
    print("=" * 60)
    print("✅ Database initialization completed successfully!")
    print("=" * 60)
    print()
    print("You can now start the backend server with:")
    print("  python main.py")
    print()


if __name__ == "__main__":
    main()
