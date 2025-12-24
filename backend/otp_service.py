# otp_service.py - OTP generation and validation
import secrets
import bcrypt
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import OTP
import logging

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 10


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return f"{secrets.randbelow(900000) + 100000:06d}"


def hash_otp(otp: str) -> str:
    """Hash OTP for secure storage"""
    return bcrypt.hashpw(otp.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_otp_record(email: str, signup_data: dict, db: Session) -> tuple[str, OTP]:
    """
    Create OTP record in database.
    Returns: (plain_otp, otp_record)
    """
    # Generate OTP
    plain_otp = generate_otp()
    hashed_otp = hash_otp(plain_otp)
    
    # Delete any existing OTPs for this email
    db.query(OTP).filter(OTP.email == email, OTP.is_used == False).delete()
    
    # Create new OTP record
    otp_record = OTP(
        email=email,
        otp_code=hashed_otp,
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        is_used=False,
        signup_data=json.dumps(signup_data)  # Store signup data temporarily
    )
    
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    logger.info(f"OTP record created for {email}")
    return plain_otp, otp_record


def verify_otp(email: str, otp_code: str, db: Session) -> tuple[bool, dict | None]:
    """
    Verify OTP code.
    Returns: (is_valid, signup_data)
    """
    # Find latest unused OTP for this email
    otp_record = db.query(OTP).filter(
        OTP.email == email,
        OTP.is_used == False
    ).order_by(OTP.created_at.desc()).first()
    
    if not otp_record:
        logger.warning(f"No OTP found for {email}")
        return False, None
    
    # Check if expired
    if otp_record.is_expired():
        logger.warning(f"OTP expired for {email}")
        return False, None
    
    # Verify OTP code
    if not otp_record.check_otp(otp_code):
        logger.warning(f"Invalid OTP for {email}")
        return False, None
    
    # Mark as used
    otp_record.is_used = True
    db.commit()
    
    # Retrieve signup data
    signup_data = json.loads(otp_record.signup_data) if otp_record.signup_data else None
    
    logger.info(f"OTP verified successfully for {email}")
    return True, signup_data


def cleanup_expired_otps(db: Session):
    """Clean up expired OTP records"""
    expired_count = db.query(OTP).filter(
        OTP.expires_at < datetime.utcnow(),
        OTP.is_used == False
    ).delete()
    
    if expired_count > 0:
        db.commit()
        logger.info(f"Cleaned up {expired_count} expired OTP records")

