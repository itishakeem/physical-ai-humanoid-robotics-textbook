# email_service.py - Email sending service for OTP
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
USE_EMAIL = os.getenv("USE_EMAIL", "true").lower() == "true"


def send_otp_email(email: str, otp_code: str, first_name: str) -> bool:
    """
    Send OTP email to user.
    Returns True if successful, False otherwise.
    """
    if not USE_EMAIL:
        # Development mode: just log the OTP
        logger.info(f"OTP for {email}: {otp_code}")
        logger.info("Email sending disabled. Check logs for OTP.")
        return True
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Logging OTP instead.")
        logger.info(f"OTP for {email}: {otp_code}")
        return True
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify Your Email - Humanoid Robotics Textbook"
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        
        # HTML email body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-box {{ background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🤖 Email Verification</h1>
                </div>
                <div class="content">
                    <p>Hi {first_name},</p>
                    <p>Thank you for signing up for the Humanoid Robotics Textbook!</p>
                    <p>Please use the following code to verify your email address:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Humanoid Robotics Textbook Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_body = f"""
        Hi {first_name},
        
        Thank you for signing up for the Humanoid Robotics Textbook!
        
        Your verification code is: {otp_code}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account, please ignore this email.
        
        Humanoid Robotics Textbook Team
        """
        
        # Attach both versions
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")
        # Fallback: log the OTP so it can be retrieved manually
        logger.info(f"OTP for {email}: {otp_code}")
        return False

