# setup_db.py - Neon PostgreSQL setup script

from database import init_db, DATABASE_URL
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("🚀 Connecting to Neon PostgreSQL...")
    logger.info(f"Using DATABASE_URL: {DATABASE_URL}")

    try:
        init_db()
        logger.info("🎉 SUCCESS: Neon database initialized!")
        logger.info("Tables created: users, otps, chats, messages")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Neon DB: {e}")
        logger.error("Check if:\n"
                     "1️⃣ DATABASE_URL is correct\n"
                     "2️⃣ sslmode=require is included\n"
                     "3️⃣ Neon project is active")
        raise

if __name__ == "__main__":
    main()
