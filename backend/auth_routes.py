# auth_routes.py - Authentication API endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from database import get_db, User, OTP
from auth import create_access_token, get_current_user
from otp_service import create_otp_record, verify_otp, cleanup_expired_otps
from email_service import send_otp_email
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


# Request/Response Models
class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    confirm_password: str
    developer_level: str  # 'Beginner', 'Intermediate', 'Advanced'
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('confirm_password')
    def validate_confirm_password(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('developer_level')
    def validate_developer_level(cls, v):
        if v not in ['Beginner', 'Intermediate', 'Advanced']:
            raise ValueError('Developer level must be Beginner, Intermediate, or Advanced')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    developer_level: str
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SignupResponse(BaseModel):
    message: str
    email: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str
    
    @validator('otp_code')
    def validate_otp_code(cls, v):
        if not v or len(v) != 6 or not v.isdigit():
            raise ValueError('OTP must be a 6-digit number')
        return v


# API Endpoints
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Direct signup - creates user account immediately without OTP verification"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user account directly
        user = User(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            developer_level=request.developer_level,
            email_verified=True  # Set as verified since we're skipping OTP
        )
        user.set_password(request.password)

        db.add(user)
        db.commit()
        db.refresh(user)

        # Create access token
        access_token = create_access_token(data={"sub": user.id})

        logger.info(f"User account created successfully: {user.email}")

        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                developer_level=user.developer_level
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during signup: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )


@router.post("/verify-otp", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def verify_otp_endpoint(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and create user account"""
    try:
        # Verify OTP
        is_valid, signup_data = verify_otp(request.email, request.otp_code, db)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP. Please request a new one."
            )
        
        if not signup_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup data not found. Please sign up again."
            )
        
        # Check if user was created in the meantime
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user account
        user = User(
            first_name=signup_data["first_name"],
            last_name=signup_data["last_name"],
            email=signup_data["email"],
            developer_level=signup_data["developer_level"],
            email_verified=True
        )
        user.set_password(signup_data["password"])
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        logger.info(f"User account created and verified: {user.email}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                developer_level=user.developer_level
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during OTP verification: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP and create account"
        )


class ResendOTPRequest(BaseModel):
    email: EmailStr


@router.post("/resend-otp", response_model=SignupResponse)
async def resend_otp(request: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend OTP to email"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Find existing OTP record
        otp_record = db.query(OTP).filter(
            OTP.email == request.email,
            OTP.is_used == False
        ).order_by(OTP.created_at.desc()).first()
        
        if not otp_record or otp_record.is_expired():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active signup found. Please sign up again."
            )
        
        # Get signup data
        signup_data = json.loads(otp_record.signup_data) if otp_record.signup_data else None
        if not signup_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup data not found. Please sign up again."
            )
        
        # Create new OTP
        plain_otp, new_otp_record = create_otp_record(request.email, signup_data, db)
        
        # Send OTP email
        email_sent = send_otp_email(
            email=request.email,
            otp_code=plain_otp,
            first_name=signup_data["first_name"]
        )
        
        logger.info(f"OTP resent to {request.email}")
        
        return SignupResponse(
            message="OTP resent to your email.",
            email=request.email
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resending OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP"
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not user.check_password(request.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        logger.info(f"User logged in: {user.email}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                developer_level=user.developer_level
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        developer_level=current_user.developer_level
    )


@router.post("/logout")
async def logout():
    """Logout endpoint (client should discard token)"""
    return {"message": "Logged out successfully"}


class DeleteAccountRequest(BaseModel):
    password: str
    confirmation: str

    @validator('confirmation')
    def validate_confirmation(cls, v):
        if v != "DELETE":
            raise ValueError('Confirmation must be exactly "DELETE"')
        return v


@router.delete("/delete-account", status_code=status.HTTP_200_OK)
async def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account permanently"""
    try:
        # Verify password
        if not current_user.check_password(request.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )

        # Delete user account (cascade will delete related chats and messages)
        db.delete(current_user)
        db.commit()

        logger.info(f"User account deleted: {current_user.email}")

        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

