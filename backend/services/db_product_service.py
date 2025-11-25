"""Product service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from db_models import Product as DBModel_Product, Supplier
from models import ProductCreate, ProductUpdate


class ProductDatabaseService:
    """Service for Product database operations"""

    def list_all(self, db: Session) -> List[DBModel_Product]:
        """List all products"""
        return db.query(DBModel_Product).order_by(DBModel_Product.name).all()

    def list_by_supplier(self, db: Session, supplier_id: str) -> List[DBModel_Product]:
        """List products by supplier ID"""
        try:
            uuid_obj = uuid.UUID(supplier_id)
        except ValueError:
            return []

        supplier = db.query(Supplier).filter(Supplier.supplier_id == uuid_obj).first()
        if not supplier:
            return []

        return db.query(DBModel_Product).filter(DBModel_Product.supplier_id == supplier.id).all()

    def get(self, db: Session, product_id: str) -> Optional[DBModel_Product]:
        """Get product by ID"""
        try:
            uuid_obj = uuid.UUID(product_id)
        except ValueError:
            return None
        return db.query(DBModel_Product).filter(DBModel_Product.product_id == uuid_obj).first()

    def create(self, db: Session, product_create: ProductCreate) -> Optional[DBModel_Product]:
        """Create a new product"""
        # Get supplier internal ID from UUID
        try:
            supplier_uuid = uuid.UUID(product_create.supplier_id)
        except ValueError:
            return None

        supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_uuid).first()
        if not supplier:
            return None

        product = DBModel_Product(
            name=product_create.name,
            description=product_create.description,
            version=product_create.version,
            supplier_id=supplier.id,
            product_url=product_create.product_url,
            support_url=product_create.support_url,
            license_type=product_create.license_type
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def update(self, db: Session, product_id: str, product_update: ProductUpdate) -> Optional[DBModel_Product]:
        """Update a product"""
        product = self.get(db, product_id)
        if not product:
            return None

        update_data = product_update.dict(exclude_unset=True)

        # Convert supplier_id UUID to internal ID if provided
        if 'supplier_id' in update_data and update_data['supplier_id']:
            try:
                supplier_uuid = uuid.UUID(update_data['supplier_id'])
                supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_uuid).first()
                if supplier:
                    update_data['supplier_id'] = supplier.id
                else:
                    # Invalid supplier, remove from update
                    del update_data['supplier_id']
            except ValueError:
                del update_data['supplier_id']

        for key, value in update_data.items():
            setattr(product, key, value)

        product.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(product)
        return product

    def delete(self, db: Session, product_id: str) -> bool:
        """Delete a product"""
        try:
            uuid_obj = uuid.UUID(product_id)
        except ValueError:
            return False
        product = db.query(DBModel_Product).filter(DBModel_Product.product_id == uuid_obj).first()
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True


product_db_service = ProductDatabaseService()
