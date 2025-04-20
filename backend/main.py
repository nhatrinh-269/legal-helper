from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

from core.config import settings
from utils.exceptions import http_exception_handler, unhandled_exception_handler

# Import router modules
from api.routers import auth as auth_router
from api.routers.user import (
    chat as user_chat_router,
    feedback as user_feedback_router,
    payment as user_payment_router,
    subscription as user_subscription_router,
    user_info as user_info_router
)
from api.routers.admin import (
    chats as admin_chats_router,
    plans as admin_plans_router,
    users as admin_users_router,
    feedbacks as admin_feedbacks_router,
    subscriptions as admin_subscriptions_router,
    payments as admin_payments_router,
    quota as admin_quota_router,
    dashboard as admin_dashboard_router
)

# Init app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Legal Helper backend API"
)

# Middleware: CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
# Common routes
app.include_router(auth_router.router, prefix="/api/v1", tags=["Auth"])

# User routes
app.include_router(user_chat_router.router, prefix="/api/v1/user", tags=["User Chat"])
app.include_router(user_feedback_router.router, prefix="/api/v1/user", tags=["User Feedback"])
app.include_router(user_payment_router.router, prefix="/api/v1/user", tags=["User Payment"])
app.include_router(user_subscription_router.router, prefix="/api/v1/user", tags=["User Subscription"])
app.include_router(user_info_router.router, prefix="/api/v1/user", tags=["User Info"])

# Admin routes
app.include_router(admin_chats_router.router, prefix="/api/v1/admin", tags=["Admin Chats"])
app.include_router(admin_users_router.router, prefix="/api/v1/admin", tags=["Admin Users"])
app.include_router(admin_feedbacks_router.router, prefix="/api/v1/admin", tags=["Admin Feedbacks"])
app.include_router(admin_plans_router.router, prefix="/api/v1/admin", tags=["Admin Plans"])
app.include_router(admin_subscriptions_router.router, prefix="/api/v1/admin", tags=["Admin Subscriptions"])
app.include_router(admin_payments_router.router, prefix="/api/v1/admin", tags=["Admin Payments"])
app.include_router(admin_quota_router.router, prefix="/api/v1/admin", tags=["Admin Usage Quota"])
app.include_router(admin_dashboard_router.router, prefix="/api/v1/admin", tags=["Admin Dashboard"])

# Exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Root route (optional)
@app.get("/")
def read_root():
    return {"message": f"{settings.PROJECT_NAME} is running 🚀"}
