"""ADR service with database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from db_models import ADR as DBModel_ADR
from models import ADRCreate, ADRUpdate


class ADRDatabaseService:
    """Service for ADR database operations"""

    def list_all(self, db: Session) -> List[DBModel_ADR]:
        """List all ADRs"""
        return db.query(DBModel_ADR).order_by(DBModel_ADR.created_at.desc()).all()

    def get(self, db: Session, adr_id: str) -> Optional[DBModel_ADR]:
        """Get ADR by ID"""
        return db.query(DBModel_ADR).filter(DBModel_ADR.adr_id == adr_id).first()

    def create(self, db: Session, adr_create: ADRCreate) -> DBModel_ADR:
        """Create a new ADR"""
        # Generate ADR ID from date and title
        date_str = datetime.now().strftime("%Y%m%d")
        title_slug = adr_create.title.lower().replace(" ", "-")[:50]
        adr_id = f"{date_str}-{title_slug}"

        # Convert options to dict format
        options_dict = [opt.dict() for opt in adr_create.options]

        adr = DBModel_ADR(
            adr_id=adr_id,
            title=adr_create.title,
            context=adr_create.context,
            options=options_dict,
            recommended_option=adr_create.recommended_option,
            strategic_selection=adr_create.strategic_selection,
            interim_selection=adr_create.interim_selection,
            decision_rationale=adr_create.decision_rationale,
            consequences=adr_create.consequences,
            stakeholders=adr_create.stakeholders,
            related_adrs=adr_create.related_adrs,
            status=adr_create.status.value
        )
        db.add(adr)
        db.commit()
        db.refresh(adr)
        return adr

    def update(self, db: Session, adr_id: str, adr_update: ADRUpdate) -> Optional[DBModel_ADR]:
        """Update an ADR"""
        adr = self.get(db, adr_id)
        if not adr:
            return None

        update_data = adr_update.dict(exclude_unset=True)

        # Convert options to dict format if provided
        if 'options' in update_data and update_data['options']:
            update_data['options'] = [opt.dict() for opt in update_data['options']]

        # Convert status enum if provided
        if 'status' in update_data and update_data['status']:
            update_data['status'] = update_data['status'].value

        for key, value in update_data.items():
            setattr(adr, key, value)

        adr.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(adr)
        return adr

    def delete(self, db: Session, adr_id: str) -> bool:
        """Delete an ADR"""
        adr = self.get(db, adr_id)
        if not adr:
            return False
        db.delete(adr)
        db.commit()
        return True


adr_db_service = ADRDatabaseService()
