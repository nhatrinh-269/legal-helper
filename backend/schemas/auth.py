from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    user_id: int
    email: EmailStr
    role: str

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class RegisterResponse(BaseModel):
    message: str
    user_id: int
