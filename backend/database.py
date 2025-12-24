# database.py - Neon PostgreSQL connection and models (UPDATED)

import os
from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv
import logging
import bcrypt

load_dotenv()
logger = logging.getLogger(__name__)

# ------------------------------------------
# 🔥 Neon PostgreSQL Connection
# ------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception(
        "❌ DATABASE_URL missing! Add it to .env\nExample:\n"
        "postgresql://user:pass@ep-1234.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )

# Neon requires SSL
if "sslmode" not in DATABASE_URL:
    DATABASE_URL += "?sslmode=require"

# Engine optimized for Neon (pool_pre_ping handles timeouts)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ------------------------------------------
# 🔥 Database Models
# ------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    developer_level = Column(String, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False, index=True)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    signup_data = Column(Text, nullable=True)

    def is_expired(self) -> bool:
        """Check if OTP has expired"""
        return datetime.utcnow() > self.expires_at

    def check_otp(self, otp_code: str) -> bool:
        """Verify OTP code against stored hash"""
        return bcrypt.checkpw(otp_code.encode(), self.otp_code.encode())


class Chat(Base):
    __tablename__ = "chats"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_id = Column(String, ForeignKey("chats.id", ondelete="CASCADE"))
    role = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chat = relationship("Chat", back_populates="messages")


# ------------------------------------------
# 🔥 Initializer
# ------------------------------------------

def init_db():
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Neon Database tables created successfully")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
