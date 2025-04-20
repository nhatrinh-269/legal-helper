from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import os

# Lấy URL từ biến môi trường hoặc config trực tiếp
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/legalhelperdb")

# Nếu bạn dùng async:
# DATABASE_URL = "mysql+aiomysql://root:password@localhost:3306/legalhelperdb"

# Tạo engine
engine = create_engine(DATABASE_URL, echo=True)

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
