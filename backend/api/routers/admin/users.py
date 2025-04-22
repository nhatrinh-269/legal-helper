# backend/api/routers/admin/users.py
from typing       import List, Optional
from fastapi      import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection   import get_db
from models.User           import User as UserModel
from schemas.admin.users   import AdminUser, ToggleStatusResponse
router = APIRouter()
@router.get("/", response_model=List[AdminUser], tags=["Admin Users"])
def list_users(
    role: Optional[str]   = None,
    status: Optional[str] = None,
    db: Session           = Depends(get_db)
):
    query = db.query(UserModel)
    if role:
        query = query.filter(UserModel.role == role)
    if status:
        query = query.filter(UserModel.status == status)
    return query.order_by(UserModel.user_id).all()
@router.patch(
    "/{user_id}/status",
    response_model=ToggleStatusResponse,
    status_code=status.HTTP_200_OK,
    tags=["Admin Users"]
)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_status = "inactive" if user.status == "active" else "active"
    user.status = new_status
    db.commit()
    return ToggleStatusResponse(success=True, user_id=user_id, status=new_status)