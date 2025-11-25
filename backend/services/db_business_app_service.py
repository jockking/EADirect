"""Business App service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from db_models import BusinessApp as DBModel_BusinessApp, Product
from models import BusinessAppCreate, BusinessAppUpdate


class BusinessAppDatabaseService:
    """Service for Business App database operations"""

    def list_all(self, db: Session) -> List[DBModel_BusinessApp]:
        """List all business apps"""
        return db.query(DBModel_BusinessApp).order_by(DBModel_BusinessApp.name).all()

    def get(self, db: Session, app_id: str) -> Optional[DBModel_BusinessApp]:
        """Get business app by ID"""
        try:
            uuid_obj = uuid.UUID(app_id)
        except ValueError:
            return None
        return db.query(DBModel_BusinessApp).filter(DBModel_BusinessApp.app_id == uuid_obj).first()

    def create(self, db: Session, app_create: BusinessAppCreate) -> DBModel_BusinessApp:
        """Create a new business app"""
        # app_id will be auto-generated as UUID by the database
        # Pydantic validators have already normalized enum values to lowercase
        # Pass the enum value directly, SQLAlchemy will handle the type conversion

        # Convert product UUID to internal ID if provided
        product_db_id = None
        if app_create.product_id:
            try:
                product_uuid = uuid.UUID(app_create.product_id)
                product = db.query(Product).filter(Product.product_id == product_uuid).first()
                if product:
                    product_db_id = product.id
            except ValueError:
                pass

        app = DBModel_BusinessApp(
            name=app_create.name,
            description=app_create.description,
            architectural_owner=app_create.architectural_owner,
            business_owner=app_create.business_owner,
            product_owner=app_create.product_owner,
            system_owner=app_create.system_owner,
            status=app_create.status.value if app_create.status else None,
            resilience_category=app_create.resilience_category.value if app_create.resilience_category else None,
            geographic_locations=app_create.geographic_locations,
            hosting_type=app_create.hosting_type.value if app_create.hosting_type else None,
            cloud_provider=app_create.cloud_provider,
            development_type=app_create.development_type.value if app_create.development_type else None,
            technologies=app_create.technologies,
            dependencies=app_create.dependencies,
            product_id=product_db_id
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        return app

    def update(self, db: Session, app_id: str, app_update: BusinessAppUpdate) -> Optional[DBModel_BusinessApp]:
        """Update a business app"""
        app = self.get(db, app_id)
        if not app:
            return None

        update_data = app_update.dict(exclude_unset=True)

        # Extract enum values (already normalized to lowercase by validators)
        # Pass values directly to SQLAlchemy for proper type handling
        if 'status' in update_data and update_data['status']:
            update_data['status'] = update_data['status'].value

        if 'resilience_category' in update_data and update_data['resilience_category']:
            update_data['resilience_category'] = update_data['resilience_category'].value

        if 'hosting_type' in update_data and update_data['hosting_type']:
            update_data['hosting_type'] = update_data['hosting_type'].value

        if 'development_type' in update_data and update_data['development_type']:
            update_data['development_type'] = update_data['development_type'].value

        # Convert product UUID to internal ID if provided
        if 'product_id' in update_data and update_data['product_id']:
            try:
                product_uuid = uuid.UUID(update_data['product_id'])
                product = db.query(Product).filter(Product.product_id == product_uuid).first()
                if product:
                    update_data['product_id'] = product.id
                else:
                    del update_data['product_id']
            except ValueError:
                del update_data['product_id']

        for key, value in update_data.items():
            setattr(app, key, value)

        app.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(app)
        return app

    def delete(self, db: Session, app_id: str) -> bool:
        """Delete a business app"""
        try:
            uuid_obj = uuid.UUID(app_id)
        except ValueError:
            return False
        app = db.query(DBModel_BusinessApp).filter(DBModel_BusinessApp.app_id == uuid_obj).first()
        if not app:
            return False
        db.delete(app)
        db.commit()
        return True


business_app_db_service = BusinessAppDatabaseService()
