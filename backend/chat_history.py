# chat_history.py - API endpoints for chat history management
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from database import get_db, Chat, Message, User
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat-history", tags=["chat-history"])


# Pydantic models for request/response
class MessageCreate(BaseModel):
    role: str
    text: str


class MessageResponse(BaseModel):
    id: int
    role: str
    text: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    
    class Config:
        from_attributes = True


# API Endpoints
@router.post("/chats", response_model=ChatResponse)
async def create_chat(chat: ChatCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new chat (requires authentication)"""
    try:
        chat_id = str(uuid.uuid4())
        new_chat = Chat(
            id=chat_id,
            user_id=current_user.id,
            title=chat.title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        # Add welcome message
        welcome_msg = Message(
            chat_id=chat_id,
            role="bot",
            text="Hey there! 👋 I'm your friendly AI guide for all things humanoid robotics and bipedal locomotion!\n\nI'd love to help you learn about:\n• Zero Moment Point (ZMP) and how robots keep their balance\n• Torque control & actuators (the robot's muscles!)\n• Balance recovery techniques\n• Amazing robots like Atlas, Figure 01, and Tesla Optimus\n• Reinforcement learning for walking\n\nWhat would you like to explore today? Feel free to ask me anything! 🤖",
            created_at=datetime.utcnow()
        )
        db.add(welcome_msg)
        db.commit()
        db.refresh(new_chat)
        
        return ChatResponse(
            id=new_chat.id,
            title=new_chat.title,
            created_at=new_chat.created_at,
            updated_at=new_chat.updated_at,
            messages=[MessageResponse(
                id=welcome_msg.id,
                role=welcome_msg.role,
                text=welcome_msg.text,
                created_at=welcome_msg.created_at
            )]
        )
    except Exception as e:
        logger.error(f"Error creating chat: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats", response_model=List[ChatListResponse])
async def get_all_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all chats for current user with message count (requires authentication)"""
    try:
        chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.updated_at.desc()).all()
        result = []
        for chat in chats:
            message_count = db.query(Message).filter(Message.chat_id == chat.id).count()
            result.append(ChatListResponse(
                id=chat.id,
                title=chat.title,
                created_at=chat.created_at,
                updated_at=chat.updated_at,
                message_count=message_count
            ))
        return result
    except Exception as e:
        logger.error(f"Error getting chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific chat with all messages (requires authentication)"""
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
        
        return ChatResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
            messages=[MessageResponse(
                id=msg.id,
                role=msg.role,
                text=msg.text,
                created_at=msg.created_at
            ) for msg in messages]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
async def add_message(chat_id: str, message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Add a message to a chat (requires authentication)"""
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        new_message = Message(
            chat_id=chat_id,
            role=message.role,
            text=message.text,
            created_at=datetime.utcnow()
        )
        db.add(new_message)
        
        # Update chat title if it's still "New Conversation" and this is the first user message
        if chat.title == "New Conversation" and message.role == "user":
            chat.title = message.text[:36] + ("…" if len(message.text) > 36 else "")
        
        chat.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(new_message)
        
        return MessageResponse(
            id=new_message.id,
            role=new_message.role,
            text=new_message.text,
            created_at=new_message.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding message: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a chat and all its messages (requires authentication)"""
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        db.delete(chat)
        db.commit()
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chats")
async def delete_all_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete all chats for current user (requires authentication)"""
    try:
        db.query(Chat).filter(Chat.user_id == current_user.id).delete()
        db.commit()
        return {"message": "All chats deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting all chats: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/chats/{chat_id}/clear")
async def clear_chat_messages(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Clear all messages from a chat (requires authentication)"""
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Delete all messages
        db.query(Message).filter(Message.chat_id == chat_id).delete()
        
        # Add welcome message
        welcome_msg = Message(
            chat_id=chat_id,
            role="bot",
            text="Hey there! 👋 I'm your friendly AI guide for all things humanoid robotics and bipedal locomotion!\n\nI'd love to help you learn about:\n• Zero Moment Point (ZMP) and how robots keep their balance\n• Torque control & actuators (the robot's muscles!)\n• Balance recovery techniques\n• Amazing robots like Atlas, Figure 01, and Tesla Optimus\n• Reinforcement learning for walking\n\nWhat would you like to explore today? Feel free to ask me anything! 🤖",
            created_at=datetime.utcnow()
        )
        db.add(welcome_msg)
        chat.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Chat cleared successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing chat: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

