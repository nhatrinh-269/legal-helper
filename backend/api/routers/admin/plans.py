# backend/api/routers/admin/plans.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.ServicePackages import ServicePackage as PlanModel
from schemas.admin.plans import AdminPlan, CreatePlan, UpdatePlan, DeleteResponse
from api.dependencies import get_db

router = APIRouter()

@router.get("", response_model=List[AdminPlan], summary="Get all service packages")
def get_plans(db: Session = Depends(get_db)):
    return db.query(PlanModel).order_by(PlanModel.package_id).all()

@router.post("", response_model=AdminPlan, summary="Create a new package")
def create_plan(plan_in: CreatePlan, db: Session = Depends(get_db)):
    plan = PlanModel(**plan_in.dict())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.patch("/{plan_id}", response_model=AdminPlan, summary="Update an existing package")
def update_plan(plan_id: int, plan_in: UpdatePlan, db: Session = Depends(get_db)):
    plan = db.query(PlanModel).filter(PlanModel.package_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    for field, value in plan_in.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}", response_model=DeleteResponse, summary="Delete a package")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(PlanModel).filter(PlanModel.package_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    db.delete(plan)
    db.commit()
    return DeleteResponse(success=True)
