from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth.auth import authenticate_user
from auth.password import hash_password
from database.connection import get_db
from models.User import User, UserRole
from schemas.auth import LoginRequest, RegisterRequest, LoginResponse, RegisterResponse
from models.Subscriptions import Subscription, SubscriptionStatus
from models.ServicePackages import ServicePackage
from models.UsageQuota import UsageQuota
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(payload.email, payload.password, db)
    return {
        "message": "Login successful",
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role
    }

@router.post("/auth/register", response_model=RegisterResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    # 1️⃣ Tạo user mới
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 2️⃣ Gán gói Free (package_id = 1)
    free_package = db.query(ServicePackage).filter(ServicePackage.package_id == 1).first()
    if not free_package:
        raise HTTPException(status_code=500, detail="Gói Free không tồn tại")

    subscription = Subscription(
        user_id=new_user.user_id,
        package_id=free_package.package_id,
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(days=free_package.duration_days),
        status=SubscriptionStatus.active
    )
    db.add(subscription)

    # 3️⃣ Tạo bản ghi UsageQuota hôm nay (tuỳ chọn)
    usage_quota = UsageQuota(
        user_id=new_user.user_id,
        usage_date=datetime.utcnow().date(),
        questions_asked=0,
        question_limit=free_package.question_limit
    )
    db.add(usage_quota)

    db.commit()

    return {
        "message": "Đăng ký thành công",
        "user_id": new_user.user_id
    }
