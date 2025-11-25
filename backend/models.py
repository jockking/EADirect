from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class ADRStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    DEPRECATED = "deprecated"
    SUPERSEDED = "superseded"


class DecisionOption(BaseModel):
    """A decision option with pros and cons analysis."""
    name: str
    description: str
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    cost_estimate: Optional[str] = None
    effort_estimate: Optional[str] = None


class ADRCreate(BaseModel):
    title: str
    context: str
    options: List[DecisionOption] = Field(default_factory=list)
    recommended_option: Optional[str] = None
    strategic_selection: Optional[str] = None
    interim_selection: Optional[str] = None
    decision_rationale: Optional[str] = None
    consequences: str
    stakeholders: List[str] = Field(default_factory=list)
    related_adrs: List[str] = Field(default_factory=list)
    status: ADRStatus = ADRStatus.PROPOSED

    @field_validator('status', mode='before')
    @classmethod
    def normalize_enum_case(cls, v):
        """Convert enum values to lowercase before validation"""
        if isinstance(v, str):
            return v.lower()
        return v


class ADRUpdate(BaseModel):
    title: Optional[str] = None
    context: Optional[str] = None
    options: Optional[List[DecisionOption]] = None
    recommended_option: Optional[str] = None
    strategic_selection: Optional[str] = None
    interim_selection: Optional[str] = None
    decision_rationale: Optional[str] = None
    consequences: Optional[str] = None
    stakeholders: Optional[List[str]] = None
    related_adrs: Optional[List[str]] = None
    status: Optional[ADRStatus] = None

    @field_validator('status', mode='before')
    @classmethod
    def normalize_enum_case(cls, v):
        """Convert enum values to lowercase before validation"""
        if isinstance(v, str):
            return v.lower()
        return v


class ADR(BaseModel):
    id: str
    title: str
    context: str
    options: List[DecisionOption]
    recommended_option: Optional[str] = None
    strategic_selection: Optional[str] = None
    interim_selection: Optional[str] = None
    decision_rationale: Optional[str] = None
    consequences: str
    stakeholders: List[str]
    related_adrs: List[str]
    status: ADRStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    author: Optional[str] = None


class BusinessAppStatus(str, Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    PLANNED = "planned"
    RETIRED = "retired"


class ResilienceCategory(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class HostingType(str, Enum):
    CLOUD = "cloud"
    ON_PREMISE = "on-premise"
    HYBRID = "hybrid"
    MANAGED_HOSTING = "managed-hosting"


class DevelopmentType(str, Enum):
    SAAS = "saas"
    COTS = "cots"
    CUSTOM = "custom"
    OPEN_SOURCE = "open-source"
    LOW_CODE = "low-code"
    INTERNAL = "internal"


class BusinessAppCreate(BaseModel):
    name: str
    description: str
    architectural_owner: str
    business_owner: Optional[str] = None
    product_owner: Optional[str] = None
    system_owner: Optional[str] = None
    status: BusinessAppStatus = BusinessAppStatus.ACTIVE
    resilience_category: Optional[ResilienceCategory] = None
    geographic_locations: List[str] = Field(default_factory=list)
    hosting_type: Optional[HostingType] = None
    cloud_provider: Optional[str] = None
    development_type: Optional[DevelopmentType] = None
    technologies: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    product_id: Optional[str] = None  # UUID of product

    @field_validator('status', 'resilience_category', 'hosting_type', 'development_type', mode='before')
    @classmethod
    def normalize_enum_case(cls, v, info):
        """Convert enum member names to their values"""
        if not isinstance(v, str):
            return v

        # Map field name to enum class
        enum_map = {
            'status': BusinessAppStatus,
            'resilience_category': ResilienceCategory,
            'hosting_type': HostingType,
            'development_type': DevelopmentType
        }

        enum_class = enum_map.get(info.field_name)
        if not enum_class:
            return v.lower()

        # Try to match by member name (case-insensitive)
        v_upper = v.upper()
        for member in enum_class:
            if member.name == v_upper:
                return member.value

        # Fall back to lowercase for direct value matching
        return v.lower()


class BusinessAppUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    architectural_owner: Optional[str] = None
    business_owner: Optional[str] = None
    product_owner: Optional[str] = None
    system_owner: Optional[str] = None
    status: Optional[BusinessAppStatus] = None
    resilience_category: Optional[ResilienceCategory] = None
    geographic_locations: Optional[List[str]] = None
    hosting_type: Optional[HostingType] = None
    cloud_provider: Optional[str] = None
    development_type: Optional[DevelopmentType] = None
    technologies: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    product_id: Optional[str] = None

    @field_validator('status', 'resilience_category', 'hosting_type', 'development_type', mode='before')
    @classmethod
    def normalize_enum_case(cls, v, info):
        """Convert enum member names to their values"""
        if not isinstance(v, str):
            return v

        # Map field name to enum class
        enum_map = {
            'status': BusinessAppStatus,
            'resilience_category': ResilienceCategory,
            'hosting_type': HostingType,
            'development_type': DevelopmentType
        }

        enum_class = enum_map.get(info.field_name)
        if not enum_class:
            return v.lower()

        # Try to match by member name (case-insensitive)
        v_upper = v.upper()
        for member in enum_class:
            if member.name == v_upper:
                return member.value

        # Fall back to lowercase for direct value matching
        return v.lower()


class BusinessApp(BaseModel):
    id: str
    name: str
    description: str
    architectural_owner: str
    business_owner: Optional[str] = None
    product_owner: Optional[str] = None
    system_owner: Optional[str] = None
    status: BusinessAppStatus
    resilience_category: Optional[ResilienceCategory] = None
    geographic_locations: List[str]
    hosting_type: Optional[HostingType] = None
    cloud_provider: Optional[str] = None
    development_type: Optional[DevelopmentType] = None
    technologies: List[str]
    dependencies: List[str]
    product_id: Optional[str] = None
    product_name: Optional[str] = None  # Included for convenience
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GitHistoryEntry(BaseModel):
    commit_hash: str
    author: str
    date: datetime
    message: str


class SearchResult(BaseModel):
    artifact_type: str
    artifact_id: str
    title: str
    snippet: str


class TechDebtPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TechDebtStatus(str, Enum):
    IDENTIFIED = "identified"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    WONT_FIX = "wont-fix"


class TechDebtCreate(BaseModel):
    title: str
    description: str
    linked_adr_id: Optional[str] = None
    owner: str
    priority: TechDebtPriority = TechDebtPriority.MEDIUM
    status: TechDebtStatus = TechDebtStatus.IDENTIFIED
    impact: Optional[str] = None
    effort_estimate: Optional[str] = None
    target_resolution_date: Optional[date] = None
    affected_systems: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    @field_validator('priority', 'status', mode='before')
    @classmethod
    def normalize_enum_case(cls, v):
        """Convert enum values to lowercase before validation"""
        if isinstance(v, str):
            return v.lower()
        return v


class TechDebtUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    linked_adr_id: Optional[str] = None
    owner: Optional[str] = None
    priority: Optional[TechDebtPriority] = None
    status: Optional[TechDebtStatus] = None
    impact: Optional[str] = None
    effort_estimate: Optional[str] = None
    target_resolution_date: Optional[date] = None
    actual_resolution_date: Optional[date] = None
    affected_systems: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    @field_validator('priority', 'status', mode='before')
    @classmethod
    def normalize_enum_case(cls, v):
        """Convert enum values to lowercase before validation"""
        if isinstance(v, str):
            return v.lower()
        return v


class TechDebt(BaseModel):
    id: str
    title: str
    description: str
    linked_adr_id: Optional[str] = None
    owner: str
    priority: TechDebtPriority
    status: TechDebtStatus
    impact: Optional[str] = None
    effort_estimate: Optional[str] = None
    created_date: Optional[date] = None
    target_resolution_date: Optional[date] = None
    actual_resolution_date: Optional[date] = None
    affected_systems: List[str]
    tags: List[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Supplier Models
class SupplierCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None


class Supplier(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Product Models
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    supplier_id: str  # UUID of supplier
    product_url: Optional[str] = None
    support_url: Optional[str] = None
    license_type: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    supplier_id: Optional[str] = None
    product_url: Optional[str] = None
    support_url: Optional[str] = None
    license_type: Optional[str] = None


class Product(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    supplier_id: str
    supplier_name: Optional[str] = None  # Included for convenience
    product_url: Optional[str] = None
    support_url: Optional[str] = None
    license_type: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
