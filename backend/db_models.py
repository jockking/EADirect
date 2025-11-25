"""SQLAlchemy database models for Enterprise Architecture"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

Base = declarative_base()


# Enums
class ADRStatusEnum(str, enum.Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    DEPRECATED = "deprecated"
    SUPERSEDED = "superseded"


class BusinessAppStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    PLANNED = "planned"
    RETIRED = "retired"


class ResilienceCategoryEnum(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class HostingTypeEnum(str, enum.Enum):
    CLOUD = "cloud"
    ON_PREMISE = "on-premise"
    HYBRID = "hybrid"
    MANAGED_HOSTING = "managed-hosting"


class DevelopmentTypeEnum(str, enum.Enum):
    SAAS = "saas"  # Software as a Service
    COTS = "cots"  # Commercial Off-The-Shelf
    CUSTOM = "custom"  # Custom/Bespoke Development
    OPEN_SOURCE = "open-source"  # Open Source Software
    LOW_CODE = "low-code"  # Low-Code/No-Code Platform
    INTERNAL = "internal"  # Internally Developed


class TechDebtPriorityEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TechDebtStatusEnum(str, enum.Enum):
    IDENTIFIED = "identified"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    WONT_FIX = "wont-fix"


class UserRoleEnum(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class UserStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    status = Column(String(50), default="active", nullable=False)
    auth_provider = Column(String(50), default="local", nullable=False)  # local, sso, oauth, etc.
    profile_image_url = Column(String(500), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ADR(Base):
    __tablename__ = "adrs"

    id = Column(Integer, primary_key=True, index=True)
    adr_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g., "20231119-use-postgres"
    title = Column(String(500), nullable=False)
    context = Column(Text, nullable=False)
    options = Column(JSON, default=list)  # List of DecisionOption objects
    recommended_option = Column(String(255), nullable=True)
    strategic_selection = Column(String(255), nullable=True)
    interim_selection = Column(String(255), nullable=True)
    decision_rationale = Column(Text, nullable=True)
    consequences = Column(Text, nullable=False)
    stakeholders = Column(JSON, default=list)  # List of strings
    related_adrs = Column(JSON, default=list)  # List of ADR IDs
    status = Column(String(50), default="proposed", nullable=False)
    author = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to tech debt
    tech_debts = relationship("TechDebt", back_populates="linked_adr")


class BusinessApp(Base):
    __tablename__ = "business_apps"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="active", nullable=False)

    # Ownership Information
    architectural_owner = Column(String(255), nullable=False)
    business_owner = Column(String(255), nullable=True)
    product_owner = Column(String(255), nullable=True)
    system_owner = Column(String(255), nullable=True)

    # Resilience
    resilience_category = Column(String(50), nullable=True)

    # Geographic Information
    geographic_locations = Column(JSON, default=list)  # List of locations/regions

    # Hosting & Deployment
    hosting_type = Column(String(50), nullable=True)
    cloud_provider = Column(String(255), nullable=True)  # AWS, Azure, GCP, etc.

    # Development Type
    development_type = Column(String(50), nullable=True)

    # Technical Information
    technologies = Column(JSON, default=list)  # List of strings
    dependencies = Column(JSON, default=list)  # List of app IDs

    # Product/Supplier Information
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="business_apps")


class TechDebt(Base):
    __tablename__ = "tech_debt"

    id = Column(Integer, primary_key=True, index=True)
    debt_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g., "debt-20231119-legacy-api"
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    linked_adr_id = Column(Integer, ForeignKey("adrs.id"), nullable=True)
    owner = Column(String(255), nullable=False)
    priority = Column(String(50), default="medium", nullable=False)
    status = Column(String(50), default="identified", nullable=False)
    impact = Column(Text, nullable=True)
    effort_estimate = Column(String(100), nullable=True)
    created_date = Column(Date, nullable=True)
    target_resolution_date = Column(Date, nullable=True)
    actual_resolution_date = Column(Date, nullable=True)
    affected_systems = Column(JSON, default=list)  # List of strings
    tags = Column(JSON, default=list)  # List of strings
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to ADR
    linked_adr = relationship("ADR", back_populates="tech_debts")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to products
    products = relationship("Product", back_populates="supplier", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(100), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    product_url = Column(String(500), nullable=True)
    support_url = Column(String(500), nullable=True)
    license_type = Column(String(100), nullable=True)  # e.g., "Commercial", "Open Source", "Subscription"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    business_apps = relationship("BusinessApp", back_populates="product")
