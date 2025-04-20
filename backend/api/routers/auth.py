from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth.auth import authenticate_user
from auth.password import hash_password
from database.connection import get_db
from models.User import User, UserRole
from schemas.auth import LoginRequest, RegisterRequest, LoginResponse, RegisterResponse

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

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Đăng ký thành công",
        "user_id": new_user.user_id
    }
