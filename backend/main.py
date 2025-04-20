from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

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

# Mount thư mục static
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/js",  StaticFiles(directory="frontend/js"), name="js")
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")

# Thiết lập templates
templates = Jinja2Templates(directory="frontend/pages")

# Root
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Auth
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# User pages
@app.get("/user/chat", response_class=HTMLResponse)
async def user_chat(request: Request):
    return templates.TemplateResponse("user/chat.html", {"request": request})

@app.get("/user/feedback", response_class=HTMLResponse)
async def user_feedback(request: Request):
    return templates.TemplateResponse("user/feedback.html", {"request": request})

@app.get("/user/payment", response_class=HTMLResponse)
async def user_payment(request: Request):
    return templates.TemplateResponse("user/payment.html", {"request": request})

@app.get("/user/subscription", response_class=HTMLResponse)
async def user_subscription(request: Request):
    return templates.TemplateResponse("user/subscription.html", {"request": request})

@app.get("/user/information", response_class=HTMLResponse)
async def user_info(request: Request):
    return templates.TemplateResponse("user/user_information.html", {"request": request})

# Admin pages
@app.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    return templates.TemplateResponse("admin/dasboard.html", {"request": request})

@app.get("/admin/users", response_class=HTMLResponse)
async def admin_users(request: Request):
    return templates.TemplateResponse("admin/users.html", {"request": request})

@app.get("/admin/feedbacks", response_class=HTMLResponse)
async def admin_feedbacks(request: Request):
    return templates.TemplateResponse("admin/feedbacks.html", {"request": request})

@app.get("/admin/chats", response_class=HTMLResponse)
async def admin_chats(request: Request):
    return templates.TemplateResponse("admin/chats.html", {"request": request})

@app.get("/admin/plans", response_class=HTMLResponse)
async def admin_plans(request: Request):
    return templates.TemplateResponse("admin/plans.html", {"request": request})

@app.get("/admin/subscriptions", response_class=HTMLResponse)
async def admin_subscriptions(request: Request):
    return templates.TemplateResponse("admin/subscriptions.html", {"request": request})

@app.get("/admin/payments", response_class=HTMLResponse)
async def admin_payments(request: Request):
    return templates.TemplateResponse("admin/payments.html", {"request": request})

@app.get("/admin/usagequota", response_class=HTMLResponse)
async def admin_usage_quota(request: Request):
    return templates.TemplateResponse("admin/usagequota.html", {"request": request})

@app.get("/admin/settings", response_class=HTMLResponse)
async def admin_settings(request: Request):
    return templates.TemplateResponse("admin/settings.html", {"request": request})
