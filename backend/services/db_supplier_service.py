"""Supplier service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from db_models import Supplier as DBModel_Supplier
from models import SupplierCreate, SupplierUpdate


class SupplierDatabaseService:
    """Service for Supplier database operations"""

    def list_all(self, db: Session) -> List[DBModel_Supplier]:
        """List all suppliers"""
        return db.query(DBModel_Supplier).order_by(DBModel_Supplier.name).all()

    def get(self, db: Session, supplier_id: str) -> Optional[DBModel_Supplier]:
        """Get supplier by ID"""
        try:
            uuid_obj = uuid.UUID(supplier_id)
        except ValueError:
            return None
        return db.query(DBModel_Supplier).filter(DBModel_Supplier.supplier_id == uuid_obj).first()

    def get_by_name(self, db: Session, name: str) -> Optional[DBModel_Supplier]:
        """Get supplier by name"""
        return db.query(DBModel_Supplier).filter(DBModel_Supplier.name == name).first()

    def create(self, db: Session, supplier_create: SupplierCreate) -> DBModel_Supplier:
        """Create a new supplier"""
        supplier = DBModel_Supplier(
            name=supplier_create.name,
            description=supplier_create.description,
            website=supplier_create.website,
            contact_email=supplier_create.contact_email,
            contact_phone=supplier_create.contact_phone,
            address=supplier_create.address
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return supplier

    def update(self, db: Session, supplier_id: str, supplier_update: SupplierUpdate) -> Optional[DBModel_Supplier]:
        """Update a supplier"""
        supplier = self.get(db, supplier_id)
        if not supplier:
            return None

        update_data = supplier_update.dict(exclude_unset=True)

        for key, value in update_data.items():
            setattr(supplier, key, value)

        supplier.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(supplier)
        return supplier

    def delete(self, db: Session, supplier_id: str) -> bool:
        """Delete a supplier"""
        try:
            uuid_obj = uuid.UUID(supplier_id)
        except ValueError:
            return False
        supplier = db.query(DBModel_Supplier).filter(DBModel_Supplier.supplier_id == uuid_obj).first()
        if not supplier:
            return False
        db.delete(supplier)
        db.commit()
        return True


supplier_db_service = SupplierDatabaseService()
