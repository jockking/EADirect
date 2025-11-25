"""Tech Debt service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from db_models import TechDebt as DBModel_TechDebt
from models import TechDebtCreate, TechDebtUpdate


class TechDebtDatabaseService:
    """Service for Tech Debt database operations"""

    def list_all(self, db: Session) -> List[DBModel_TechDebt]:
        """List all tech debt items"""
        return db.query(DBModel_TechDebt).order_by(DBModel_TechDebt.priority.desc(), DBModel_TechDebt.created_at.desc()).all()

    def get(self, db: Session, debt_id: str) -> Optional[DBModel_TechDebt]:
        """Get tech debt by ID"""
        return db.query(DBModel_TechDebt).filter(DBModel_TechDebt.debt_id == debt_id).first()

    def list_by_adr(self, db: Session, adr_id: str) -> List[DBModel_TechDebt]:
        """Get tech debt items linked to an ADR"""
        from db_models import ADR
        adr = db.query(ADR).filter(ADR.adr_id == adr_id).first()
        if not adr:
            return []
        return db.query(DBModel_TechDebt).filter(DBModel_TechDebt.linked_adr_id == adr.id).all()

    def create(self, db: Session, debt_create: TechDebtCreate) -> DBModel_TechDebt:
        """Create a new tech debt item"""
        # Generate debt ID from date and title
        date_str = datetime.now().strftime("%Y%m%d")
        title_slug = debt_create.title.lower().replace(" ", "-")[:50]
        debt_id = f"debt-{date_str}-{title_slug}"

        # Get ADR internal ID if linked_adr_id is provided
        linked_adr_db_id = None
        if debt_create.linked_adr_id:
            from db_models import ADR
            adr = db.query(ADR).filter(ADR.adr_id == debt_create.linked_adr_id).first()
            if adr:
                linked_adr_db_id = adr.id

        debt = DBModel_TechDebt(
            debt_id=debt_id,
            title=debt_create.title,
            description=debt_create.description,
            linked_adr_id=linked_adr_db_id,
            owner=debt_create.owner,
            priority=debt_create.priority.value,
            status=debt_create.status.value,
            impact=debt_create.impact,
            effort_estimate=debt_create.effort_estimate,
            created_date=datetime.now().date(),
            target_resolution_date=debt_create.target_resolution_date,
            affected_systems=debt_create.affected_systems,
            tags=debt_create.tags
        )
        db.add(debt)
        db.commit()
        db.refresh(debt)
        return debt

    def update(self, db: Session, debt_id: str, debt_update: TechDebtUpdate) -> Optional[DBModel_TechDebt]:
        """Update a tech debt item"""
        debt = self.get(db, debt_id)
        if not debt:
            return None

        update_data = debt_update.dict(exclude_unset=True)

        # Convert linked_adr_id to internal database ID if provided
        if 'linked_adr_id' in update_data and update_data['linked_adr_id']:
            from db_models import ADR
            adr = db.query(ADR).filter(ADR.adr_id == update_data['linked_adr_id']).first()
            if adr:
                update_data['linked_adr_id'] = adr.id
            else:
                update_data['linked_adr_id'] = None

        # Convert enums if provided
        if 'priority' in update_data and update_data['priority']:
            update_data['priority'] = update_data['priority'].value
        if 'status' in update_data and update_data['status']:
            update_data['status'] = update_data['status'].value

        for key, value in update_data.items():
            setattr(debt, key, value)

        debt.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(debt)
        return debt

    def delete(self, db: Session, debt_id: str) -> bool:
        """Delete a tech debt item"""
        debt = self.get(db, debt_id)
        if not debt:
            return False
        db.delete(debt)
        db.commit()
        return True


tech_debt_db_service = TechDebtDatabaseService()
