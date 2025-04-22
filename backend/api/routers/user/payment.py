from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database.connection import get_db
from models.ServicePackages import ServicePackage
from models.Subscriptions import Subscription, SubscriptionStatus
from models.Payments import Payment, PaymentStatus, PaymentMethod
from schemas.user.payment import PackageInfoResponse, PaymentRequest, PaymentResponse

# api/routers/user/payment.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database.connection import get_db
from models.User import User
from models.ServicePackages import ServicePackage
from models.Subscriptions import Subscription, SubscriptionStatus
from models.Payments import Payment, PaymentStatus, PaymentMethod
from models.UsageQuota import UsageQuota
from schemas.user.payment import PaymentRequest, PaymentResponse

router = APIRouter()

# GET package info
@router.get("/package", response_model=PackageInfoResponse, summary="Lấy thông tin gói (từ bảng ServicePackages)"
)
def get_package_info(
    package_id: int = Query(..., description="ID của gói dịch vụ"),
    db: Session = Depends(get_db)
):
    pkg = db.query(ServicePackage).filter(ServicePackage.package_id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    methods = [m.value for m in PaymentMethod]

    return PackageInfoResponse(
        package_id=pkg.package_id,
        package_name=pkg.package_name,
        description=[line for line in (pkg.description or "").split("\n") if line],
        price=float(pkg.price),
        duration_days=pkg.duration_days,
        question_limit=pkg.question_limit,
        methods=methods
    )


@router.post(
    "/pay",
    response_model=PaymentResponse,
    summary="Thanh toán gói hoặc thông báo skip nếu không cần"
)
def create_payment(
    req: PaymentRequest,
    db: Session = Depends(get_db)
):
    # 1. Lấy user
    user = db.query(User).get(req.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. Lấy gói mới
    new_pkg = db.query(ServicePackage).get(req.package_id)
    if not new_pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    # 3. Lấy subscription active hiện tại (nếu có)
    current_sub = (
        db.query(Subscription)
          .filter(
              Subscription.user_id == user.user_id,
              Subscription.status == SubscriptionStatus.active
          )
          .first()
    )

    # 4. Nếu đã có sub active
    if current_sub:
        # 4a. Nếu cùng gói
        if current_sub.package_id == new_pkg.package_id:
            # Nếu còn hạn → skip
            if current_sub.end_time and current_sub.end_time > datetime.utcnow():
                return PaymentResponse(
                    payment_id=0,
                    status="skipped",
                    message=f"Bạn đang sử dụng gói này đến {current_sub.end_time}"
                )
            # Nếu hết hạn → cho renew tiếp vào bước 6

        else:
            # 4b. So sánh chất lượng để upgrade
            curr_pkg = db.query(ServicePackage).get(current_sub.package_id)
            curr_limit = curr_pkg.question_limit or float("inf")
            new_limit  = new_pkg.question_limit or float("inf")
            if new_limit <= curr_limit:
                return PaymentResponse(
                    payment_id=0,
                    status="skipped",
                    message="Gói bạn chọn không tốt hơn gói hiện tại"
                )
            # Nếu tốt hơn → tiếp tục vào bước 6

    # 5. Tạo record Payment (mock success)
    payment = Payment(
        user_id=user.user_id,
        package_id=new_pkg.package_id,
        method=PaymentMethod(req.method),
        amount=float(new_pkg.price),
        status=PaymentStatus.success,
        payment_time=datetime.utcnow()
    )
    db.add(payment)

    # 6. Cập nhật subscription cũ thành expired (nếu có)
    if current_sub:
        current_sub.status = SubscriptionStatus.expired
        db.add(current_sub)

    # 7. Tạo subscription mới
    new_sub = Subscription(
        user_id=user.user_id,
        package_id=new_pkg.package_id,
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(days=new_pkg.duration_days),
        status=SubscriptionStatus.active
    )
    db.add(new_sub)

    # 8. Tạo hoặc cập nhật quota hôm nay
    today = datetime.utcnow().date()
    db.query(UsageQuota).filter(
        UsageQuota.user_id == user.user_id,
        UsageQuota.usage_date == today
    ).delete()

    usage_quota = UsageQuota(
        user_id=user.user_id,
        usage_date=today,
        questions_asked=0,
        question_limit=new_pkg.question_limit
    )
    db.add(usage_quota)

    # 9. Commit
    db.commit()
    db.refresh(payment)

    # 10. Return response
    return PaymentResponse(
        payment_id=payment.payment_id,
        status="success",
        message="Thanh toán thành công và gói đã được kích hoạt"
    )
