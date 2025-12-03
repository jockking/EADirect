from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import uuid
import shutil
from PIL import Image
from io import BytesIO
from config import settings
from database import get_db
from models import (
    ADR, ADRCreate, ADRUpdate,
    BusinessApp, BusinessAppCreate, BusinessAppUpdate,
    TechDebt, TechDebtCreate, TechDebtUpdate,
    Supplier, SupplierCreate, SupplierUpdate,
    Product, ProductCreate, ProductUpdate
)
from services.db_user_service import user_service
from services.db_adr_service import adr_db_service
from services.db_business_app_service import business_app_db_service
from services.db_tech_debt_service import tech_debt_db_service
from services.db_supplier_service import supplier_db_service
from services.db_product_service import product_db_service
from db_models import User as DBUser
from pydantic import BaseModel, EmailStr

app = FastAPI(
    title="EA Direct API",
    description="Enterprise Architecture Direct - API for managing enterprise architecture artifacts",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# Pydantic models for API
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "user"
    profile_image_url: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None
    status: str | None = None
    profile_image_url: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    status: str
    auth_provider: str
    profile_image_url: str | None
    last_login: str | None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    success: bool
    user: UserResponse | None = None
    error: str | None = None


# Helper functions
def db_adr_to_model(db_adr) -> ADR:
    """Convert database ADR model to Pydantic model"""
    from models import DecisionOption
    return ADR(
        id=db_adr.adr_id,
        title=db_adr.title,
        context=db_adr.context,
        options=[DecisionOption(**opt) for opt in db_adr.options],
        recommended_option=db_adr.recommended_option,
        strategic_selection=db_adr.strategic_selection,
        interim_selection=db_adr.interim_selection,
        decision_rationale=db_adr.decision_rationale,
        consequences=db_adr.consequences,
        stakeholders=db_adr.stakeholders,
        related_adrs=db_adr.related_adrs,
        status=db_adr.status,
        created_at=db_adr.created_at,
        updated_at=db_adr.updated_at,
        author=db_adr.author
    )


def db_app_to_model(db_app) -> BusinessApp:
    """Convert database BusinessApp model to Pydantic model"""
    product_id = None
    product_name = None
    if db_app.product:
        product_id = str(db_app.product.product_id)
        product_name = db_app.product.name

    return BusinessApp(
        id=str(db_app.app_id),
        name=db_app.name,
        description=db_app.description,
        architectural_owner=db_app.architectural_owner,
        business_owner=db_app.business_owner,
        product_owner=db_app.product_owner,
        system_owner=db_app.system_owner,
        status=db_app.status,
        resilience_category=db_app.resilience_category,
        geographic_locations=db_app.geographic_locations or [],
        hosting_type=db_app.hosting_type,
        cloud_provider=db_app.cloud_provider,
        development_type=db_app.development_type,
        technologies=db_app.technologies or [],
        dependencies=db_app.dependencies or [],
        product_id=product_id,
        product_name=product_name,
        created_at=db_app.created_at,
        updated_at=db_app.updated_at
    )


def db_debt_to_model(db_debt) -> TechDebt:
    """Convert database TechDebt model to Pydantic model"""
    linked_adr_id = None
    if db_debt.linked_adr:
        linked_adr_id = db_debt.linked_adr.adr_id

    return TechDebt(
        id=db_debt.debt_id,
        title=db_debt.title,
        description=db_debt.description,
        linked_adr_id=linked_adr_id,
        owner=db_debt.owner,
        priority=db_debt.priority,
        status=db_debt.status,
        impact=db_debt.impact,
        effort_estimate=db_debt.effort_estimate,
        created_date=db_debt.created_date,
        target_resolution_date=db_debt.target_resolution_date,
        actual_resolution_date=db_debt.actual_resolution_date,
        affected_systems=db_debt.affected_systems,
        tags=db_debt.tags,
        created_at=db_debt.created_at,
        updated_at=db_debt.updated_at
    )


def db_supplier_to_model(db_supplier) -> Supplier:
    """Convert database Supplier model to Pydantic model"""
    return Supplier(
        id=str(db_supplier.supplier_id),
        name=db_supplier.name,
        description=db_supplier.description,
        website=db_supplier.website,
        contact_email=db_supplier.contact_email,
        contact_phone=db_supplier.contact_phone,
        address=db_supplier.address,
        created_at=db_supplier.created_at,
        updated_at=db_supplier.updated_at
    )


def db_product_to_model(db_product) -> Product:
    """Convert database Product model to Pydantic model"""
    supplier_name = db_product.supplier.name if db_product.supplier else None

    return Product(
        id=str(db_product.product_id),
        name=db_product.name,
        description=db_product.description,
        version=db_product.version,
        supplier_id=str(db_product.supplier.supplier_id) if db_product.supplier else "",
        supplier_name=supplier_name,
        product_url=db_product.product_url,
        support_url=db_product.support_url,
        license_type=db_product.license_type,
        created_at=db_product.created_at,
        updated_at=db_product.updated_at
    )


@app.get("/")
def read_root():
    return {
        "message": "EA Direct - Enterprise Architecture Management Platform",
        "version": "1.0.0",
        "database": "PostgreSQL",
        "endpoints": {
            "users": "/users",
            "auth": "/auth/login",
            "adrs": "/adrs",
            "business_apps": "/business-apps",
            "tech_debt": "/tech-debt",
            "suppliers": "/suppliers",
            "products": "/products",
            "dashboard": "/dashboard"
        }
    }


@app.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics for all data types"""
    from db_models import ADR as DBModel_ADR, BusinessApp as DBModel_BusinessApp, TechDebt as DBModel_TechDebt, Supplier as DBModel_Supplier, Product as DBModel_Product
    from sqlalchemy import func

    # Count totals
    total_apps = db.query(func.count(DBModel_BusinessApp.id)).scalar()
    total_adrs = db.query(func.count(DBModel_ADR.id)).scalar()
    total_tech_debt = db.query(func.count(DBModel_TechDebt.id)).scalar()
    total_suppliers = db.query(func.count(DBModel_Supplier.id)).scalar()
    total_products = db.query(func.count(DBModel_Product.id)).scalar()

    # Business Apps by status
    apps_by_status = db.query(
        DBModel_BusinessApp.status,
        func.count(DBModel_BusinessApp.id)
    ).group_by(DBModel_BusinessApp.status).all()

    # ADRs by status
    adrs_by_status = db.query(
        DBModel_ADR.status,
        func.count(DBModel_ADR.id)
    ).group_by(DBModel_ADR.status).all()

    # Tech Debt by priority
    debt_by_priority = db.query(
        DBModel_TechDebt.priority,
        func.count(DBModel_TechDebt.id)
    ).group_by(DBModel_TechDebt.priority).all()

    # Tech Debt by status
    debt_by_status = db.query(
        DBModel_TechDebt.status,
        func.count(DBModel_TechDebt.id)
    ).group_by(DBModel_TechDebt.status).all()

    # Recent items (last 5)
    recent_apps = db.query(DBModel_BusinessApp).order_by(DBModel_BusinessApp.created_at.desc()).limit(5).all()
    recent_adrs = db.query(DBModel_ADR).order_by(DBModel_ADR.created_at.desc()).limit(5).all()
    recent_debt = db.query(DBModel_TechDebt).order_by(DBModel_TechDebt.created_at.desc()).limit(5).all()

    return {
        "totals": {
            "business_apps": total_apps,
            "adrs": total_adrs,
            "tech_debt": total_tech_debt,
            "suppliers": total_suppliers,
            "products": total_products
        },
        "business_apps_by_status": {status: count for status, count in apps_by_status},
        "adrs_by_status": {status: count for status, count in adrs_by_status},
        "tech_debt_by_priority": {priority: count for priority, count in debt_by_priority},
        "tech_debt_by_status": {status: count for status, count in debt_by_status},
        "recent_business_apps": [
            {"id": str(app.app_id), "name": app.name, "created_at": app.created_at.isoformat()}
            for app in recent_apps
        ],
        "recent_adrs": [
            {"id": adr.adr_id, "title": adr.title, "created_at": adr.created_at.isoformat()}
            for adr in recent_adrs
        ],
        "recent_tech_debt": [
            {"id": debt.debt_id, "title": debt.title, "priority": debt.priority, "created_at": debt.created_at.isoformat()}
            for debt in recent_debt
        ]
    }


@app.post("/sample-data/generate")
def generate_sample_data(db: Session = Depends(get_db)):
    """Generate sample data for demonstration purposes"""
    try:
        from generate_sample_data import generate_all_sample_data
        success = generate_all_sample_data()

        if success:
            return {"success": True, "message": "Sample data generated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate sample data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sample data: {str(e)}")


# Authentication Endpoints
@app.post("/auth/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password"""
    user = user_service.authenticate(db, login_data.email, login_data.password)
    if not user:
        return LoginResponse(success=False, error="Invalid credentials")

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        profile_image_url=user.profile_image_url,
        last_login=user.last_login.isoformat() if user.last_login else None
    )
    return LoginResponse(success=True, user=user_response)


# User Endpoints
@app.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users"""
    users = user_service.get_all(db)
    return [UserResponse(
        id=u.id,
        email=u.email,
        name=u.name,
        role=u.role,
        status=u.status,
        auth_provider=u.auth_provider,
        profile_image_url=u.profile_image_url,
        last_login=u.last_login.isoformat() if u.last_login else None
    ) for u in users]


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        profile_image_url=user.profile_image_url,
        last_login=user.last_login.isoformat() if user.last_login else None
    )


@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Check if user already exists
    existing_user = user_service.get_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = user_service.create(db, user_data.email, user_data.name, user_data.password, user_data.role, user_data.profile_image_url)
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        profile_image_url=user.profile_image_url,
        last_login=user.last_login.isoformat() if user.last_login else None
    )


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user"""
    update_dict = user_data.dict(exclude_unset=True)

    user = user_service.update(db, user_id, **update_dict)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        profile_image_url=user.profile_image_url,
        last_login=user.last_login.isoformat() if user.last_login else None
    )


@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    success = user_service.delete(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")


@app.post("/users/{user_id}/profile-image")
async def upload_profile_image(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process profile image for a user"""
    # Verify user exists
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    try:
        # Open and process image
        image = Image.open(BytesIO(contents))

        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # Resize to square (crop to center if not square)
        width, height = image.size
        target_size = 400  # Standard profile image size

        if width != height:
            # Crop to square (center crop)
            min_dimension = min(width, height)
            left = (width - min_dimension) // 2
            top = (height - min_dimension) // 2
            right = left + min_dimension
            bottom = top + min_dimension
            image = image.crop((left, top, right, bottom))

        # Resize to target size
        image = image.resize((target_size, target_size), Image.Resampling.LANCZOS)

        # Delete old profile image if exists
        if user.profile_image_url:
            old_path = Path(__file__).parent / user.profile_image_url.lstrip('/')
            if old_path.exists() and old_path.is_file():
                old_path.unlink()

        # Save with unique filename
        filename = f"profile_{user_id}_{uuid.uuid4().hex[:8]}.jpg"
        filepath = UPLOAD_DIR / "profile_images" / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)

        # Save optimized JPEG
        image.save(filepath, "JPEG", quality=85, optimize=True)

        # Update user record
        image_url = f"/uploads/profile_images/{filename}"
        user_service.update(db, user_id, profile_image_url=image_url)

        return {
            "success": True,
            "profile_image_url": image_url,
            "message": "Profile image uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


# ADR Endpoints
@app.get("/adrs", response_model=List[ADR])
def list_adrs(db: Session = Depends(get_db)):
    """List all Architecture Decision Records"""
    db_adrs = adr_db_service.list_all(db)
    return [db_adr_to_model(adr) for adr in db_adrs]


@app.get("/adrs/{adr_id}", response_model=ADR)
def get_adr(adr_id: str, db: Session = Depends(get_db)):
    """Get a specific ADR by ID"""
    db_adr = adr_db_service.get(db, adr_id)
    if not db_adr:
        raise HTTPException(status_code=404, detail="ADR not found")
    return db_adr_to_model(db_adr)


@app.post("/adrs", response_model=ADR, status_code=201)
def create_adr(adr: ADRCreate, db: Session = Depends(get_db)):
    """Create a new Architecture Decision Record"""
    db_adr = adr_db_service.create(db, adr)
    return db_adr_to_model(db_adr)


@app.put("/adrs/{adr_id}", response_model=ADR)
def update_adr(adr_id: str, adr_update: ADRUpdate, db: Session = Depends(get_db)):
    """Update an existing ADR"""
    db_adr = adr_db_service.update(db, adr_id, adr_update)
    if not db_adr:
        raise HTTPException(status_code=404, detail="ADR not found")
    return db_adr_to_model(db_adr)


@app.delete("/adrs/{adr_id}", status_code=204)
def delete_adr(adr_id: str, db: Session = Depends(get_db)):
    """Delete an ADR"""
    success = adr_db_service.delete(db, adr_id)
    if not success:
        raise HTTPException(status_code=404, detail="ADR not found")


# Business App Endpoints
@app.get("/business-apps", response_model=List[BusinessApp])
def list_business_apps(db: Session = Depends(get_db)):
    """List all business applications"""
    db_apps = business_app_db_service.list_all(db)
    return [db_app_to_model(app) for app in db_apps]


@app.get("/business-apps/{app_id}", response_model=BusinessApp)
def get_business_app(app_id: str, db: Session = Depends(get_db)):
    """Get a specific business application by ID"""
    db_app = business_app_db_service.get(db, app_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Business app not found")
    return db_app_to_model(db_app)


@app.post("/business-apps", response_model=BusinessApp, status_code=201)
def create_business_app(app: BusinessAppCreate, db: Session = Depends(get_db)):
    """Create a new business application"""
    db_app = business_app_db_service.create(db, app)
    return db_app_to_model(db_app)


@app.put("/business-apps/{app_id}", response_model=BusinessApp)
def update_business_app(app_id: str, app_update: BusinessAppUpdate, db: Session = Depends(get_db)):
    """Update an existing business application"""
    db_app = business_app_db_service.update(db, app_id, app_update)
    if not db_app:
        raise HTTPException(status_code=404, detail="Business app not found")
    return db_app_to_model(db_app)


@app.delete("/business-apps/{app_id}", status_code=204)
def delete_business_app(app_id: str, db: Session = Depends(get_db)):
    """Delete a business application"""
    success = business_app_db_service.delete(db, app_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business app not found")


# Tech Debt Endpoints
@app.get("/tech-debt", response_model=List[TechDebt])
def list_tech_debt(db: Session = Depends(get_db)):
    """List all technical debt items"""
    db_debts = tech_debt_db_service.list_all(db)
    return [db_debt_to_model(debt) for debt in db_debts]


@app.get("/tech-debt/{debt_id}", response_model=TechDebt)
def get_tech_debt(debt_id: str, db: Session = Depends(get_db)):
    """Get a specific tech debt item by ID"""
    db_debt = tech_debt_db_service.get(db, debt_id)
    if not db_debt:
        raise HTTPException(status_code=404, detail="Tech debt not found")
    return db_debt_to_model(db_debt)


@app.post("/tech-debt", response_model=TechDebt, status_code=201)
def create_tech_debt(debt: TechDebtCreate, db: Session = Depends(get_db)):
    """Create a new tech debt item"""
    db_debt = tech_debt_db_service.create(db, debt)
    return db_debt_to_model(db_debt)


@app.put("/tech-debt/{debt_id}", response_model=TechDebt)
def update_tech_debt(debt_id: str, debt_update: TechDebtUpdate, db: Session = Depends(get_db)):
    """Update an existing tech debt item"""
    db_debt = tech_debt_db_service.update(db, debt_id, debt_update)
    if not db_debt:
        raise HTTPException(status_code=404, detail="Tech debt not found")
    return db_debt_to_model(db_debt)


@app.delete("/tech-debt/{debt_id}", status_code=204)
def delete_tech_debt(debt_id: str, db: Session = Depends(get_db)):
    """Delete a tech debt item"""
    success = tech_debt_db_service.delete(db, debt_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tech debt not found")


@app.get("/adrs/{adr_id}/tech-debt", response_model=List[TechDebt])
def get_adr_tech_debt(adr_id: str, db: Session = Depends(get_db)):
    """Get all tech debt items linked to an ADR"""
    db_debts = tech_debt_db_service.list_by_adr(db, adr_id)
    return [db_debt_to_model(debt) for debt in db_debts]


# Supplier Endpoints
@app.get("/suppliers", response_model=List[Supplier])
def list_suppliers(db: Session = Depends(get_db)):
    """Get all suppliers"""
    db_suppliers = supplier_db_service.list_all(db)
    return [db_supplier_to_model(s) for s in db_suppliers]


@app.get("/suppliers/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Get a specific supplier by ID"""
    db_supplier = supplier_db_service.get(db, supplier_id)
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier_to_model(db_supplier)


@app.post("/suppliers", response_model=Supplier, status_code=201)
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier"""
    # Check if supplier with same name already exists
    existing = supplier_db_service.get_by_name(db, supplier.name)
    if existing:
        raise HTTPException(status_code=400, detail="Supplier with this name already exists")

    db_supplier = supplier_db_service.create(db, supplier)
    return db_supplier_to_model(db_supplier)


@app.put("/suppliers/{supplier_id}", response_model=Supplier)
def update_supplier(supplier_id: str, supplier_update: SupplierUpdate, db: Session = Depends(get_db)):
    """Update an existing supplier"""
    db_supplier = supplier_db_service.update(db, supplier_id, supplier_update)
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier_to_model(db_supplier)


@app.delete("/suppliers/{supplier_id}", status_code=204)
def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Delete a supplier"""
    success = supplier_db_service.delete(db, supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier not found")


# Product Endpoints
@app.get("/products", response_model=List[Product])
def list_products(db: Session = Depends(get_db)):
    """Get all products"""
    db_products = product_db_service.list_all(db)
    return [db_product_to_model(p) for p in db_products]


@app.get("/suppliers/{supplier_id}/products", response_model=List[Product])
def list_supplier_products(supplier_id: str, db: Session = Depends(get_db)):
    """Get all products for a specific supplier"""
    db_products = product_db_service.list_by_supplier(db, supplier_id)
    return [db_product_to_model(p) for p in db_products]


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    db_product = product_db_service.get(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product_to_model(db_product)


@app.post("/products", response_model=Product, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    db_product = product_db_service.create(db, product)
    if not db_product:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    return db_product_to_model(db_product)


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, product_update: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product"""
    db_product = product_db_service.update(db, product_id, product_update)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product_to_model(db_product)


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    """Delete a product"""
    success = product_db_service.delete(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("Starting EA Direct API")
    print("=" * 60)
    print(f"Database: {settings.database_url.split('@')[1]}")  # Hide password
    print(f"Server: http://0.0.0.0:{settings.backend_port}")
    print(f"Docs: http://0.0.0.0:{settings.backend_port}/docs")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=settings.backend_port)
