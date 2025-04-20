from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import os
from core.config import settings

# Nếu bạn dùng async:
# DATABASE_URL = "mysql+aiomysql://root:password@localhost:3306/legalhelperdb"

# Tạo engine
engine = create_engine(settings.DATABASE_URL, echo=False)

# Nếu bạn dùng async:
# engine = create_async_engine(DATABASE_URL, echo=True)

# Tạo session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Hàm tiện dụng để lấy session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
