from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from database.connection import get_db

from models.User import User
from models.Feedback import Feedback
from models.ChatHistory import ChatHistory
from models.Payments import Payment
from models.ServicePackages import ServicePackage
from models.Subscriptions import Subscription
from models.UsageQuota import UsageQuota

router = APIRouter()

@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_feedbacks = db.query(Feedback).count()
    total_questions_today = db.query(func.sum(UsageQuota.questions_asked)).filter(
        UsageQuota.usage_date == date.today()).scalar() or 0
    monthly_revenue = db.query(func.sum(Payment.amount)).filter(
        func.month(Payment.payment_time) == datetime.now().month,
        Payment.status == "success"
    ).scalar() or 0

    return {
        "total_users": total_users,
        "total_feedbacks": total_feedbacks,
        "total_questions_today": total_questions_today,
        "monthly_revenue": monthly_revenue
    }

@router.get("/charts")
def get_chart_data(db: Session = Depends(get_db)):
    today = date.today()
    start_date = today - timedelta(days=6)

    question_data = db.query(
        UsageQuota.usage_date,
        func.sum(UsageQuota.questions_asked)
    ).filter(
        UsageQuota.usage_date >= start_date
    ).group_by(UsageQuota.usage_date).all()

    revenue_data = db.query(
        func.month(Payment.payment_time),
        func.sum(Payment.amount)
    ).filter(
        Payment.status == "success"
    ).group_by(func.month(Payment.payment_time)).all()

    package_distribution = db.query(
        ServicePackage.package_name,
        func.count(Subscription.subscription_id)
    ).join(Subscription, Subscription.package_id == ServicePackage.package_id).group_by(
        ServicePackage.package_name
    ).all()

    return {
        "questions_per_day": [
            {"date": q[0].strftime("%d/%m"), "count": q[1]} for q in question_data
        ],
        "revenue_per_month": [
            {"month": f"Tháng {r[0]}", "revenue": float(r[1])} for r in revenue_data
        ],
        "package_distribution": [
            {"name": p[0], "count": p[1]} for p in package_distribution
        ]
    }

@router.get("/latest")
def get_latest_tables(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).order_by(Feedback.timestamp.desc()).limit(5).all()
    payments = db.query(Payment).filter(Payment.status == "success").order_by(
        Payment.payment_time.desc()).limit(5).all()
    top_quota = db.query(
        UsageQuota.user_id,
        UsageQuota.questions_asked,
        UsageQuota.usage_date
    ).order_by(UsageQuota.questions_asked.desc()).limit(5).all()
    new_users = db.query(User).order_by(User.registration_time.desc()).limit(5).all()

    return {
        "feedbacks": [
            {"user": f"{fb.user_id}", "content": fb.content, "time": fb.timestamp.strftime("%d/%m %H:%M")}
            for fb in feedbacks
        ],
        "payments": [
            {"user": p.user_id, "amount": float(p.amount), "method": p.method.value, "time": p.payment_time.strftime("%d/%m")}
            for p in payments
        ],
        "top_quota": [
            {"user": q.user_id, "questions": q.questions_asked, "date": q.usage_date.strftime("%d/%m")}
            for q in top_quota
        ],
        "new_users": [
            {"name": u.full_name, "email": u.email, "time": u.registration_time.strftime("%d/%m")}
            for u in new_users
        ]
    }
