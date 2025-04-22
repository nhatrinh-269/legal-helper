from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.User import User
from auth.auth import authenticate_user  # nếu chỉ dùng email/password
# from auth.auth import get_current_user  # nếu dùng JWT
from models.User import UserRole

# Dependency: Lấy session DB
def get_db_session():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()

# Dependency: Lấy người dùng hiện tại (giả sử đã xác thực)
def get_current_user(
    db: Session = Depends(get_db),
    email: str = None,  # truyền từ router nếu không dùng token
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Dependency: Check quyền admin
def require_admin(user: User = Depends(get_current_user)):
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access only")
    return user

# Dependency: Check quyền user thường
def require_user(user: User = Depends(get_current_user)):
    if user.role != UserRole.user:
        raise HTTPException(status_code=403, detail="User access only")
    return user
