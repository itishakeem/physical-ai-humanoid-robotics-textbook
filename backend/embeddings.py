# embeddings.py  ←  FINAL CLOUD + OPENAI EMBEDDINGS (WORKS 100%)
import os
from qdrant_client import QdrantClient
from openai import OpenAI
from dotenv import load_dotenv
import logging
import time

load_dotenv()
logging.basicConfig(level=logging.INFO)

# Your existing OpenAI key (already in .env)
client_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise RuntimeError("QDRANT_URL and QDRANT_API_KEY required in .env")

qdrant = None

def connect():
      global qdrant
      while True:
          try:
              qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=15)
              # Attempt to get collection info and check if it exists
              info = qdrant.get_collection(collection_name=COLLECTION_NAME)
              logging.info(f"RAG ACTIVE | Collection: {COLLECTION_NAME} | {info.points_count} chunks")      
              return
          except Exception as e:
              # Log the specific error for debugging
              logging.warning(f"Connecting to Qdrant Cloud failed: {e}")
              time.sleep(3)
import threading
threading.Thread(target=connect, daemon=True).start()

def search_qdrant(query: str, top_k: int = 6):
    if not qdrant:
        return []
    try:
        # This generates 1536-dim vector → matches your cloud collection
        embedding = client_openai.embeddings.create(
            model="text-embedding-3-small",   # or text-embedding-ada-002
            input=query
        ).data[0].embedding

        # Use query_points for newer qdrant-client versions
        results = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=embedding,
            limit=top_k,
            with_payload=True
        )

        # Extract points from the response
        if hasattr(results, 'points'):
            points = results.points
        else:
            points = results

        if points:
            logging.info(f"RAG HIT → {len(points)} chunks retrieved")
        return points
    except Exception as e:
        logging.error(f"Search error: {e}")
        return []