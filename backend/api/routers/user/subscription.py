from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.ServicePackages import ServicePackage

router = APIRouter()

@router.get("/plans")
def get_all_service_packages(db: Session = Depends(get_db)):
    packages = db.query(ServicePackage).order_by(ServicePackage.package_id).all()
    return [{
        "package_id": pkg.package_id,
        "package_name": pkg.package_name,
        "price": float(pkg.price),
        "duration_days": pkg.duration_days,
        "question_limit": pkg.question_limit,
        "features": pkg.description.strip().split("\n"),
        "is_highlight": pkg.package_name.lower() == "pro"
    } for pkg in packages]
