# final_upload.py   ←  THIS ONE CANNOT FAIL
import os
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from openai import OpenAI
from dotenv import load_dotenv
from tqdm import tqdm
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"), timeout=120)
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
COLLECTION_NAME = "humanoid_robotics_book"
BOOK_FOLDER = r"C:\Users\USER\Hackathon\physical-ai-humanoid-robotics-textbook - Copy\my-book\docs"

# Force delete + recreate
try:
    client.delete_collection(COLLECTION_NAME)
except:
    pass  # Collection might not exist
client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)
print("Fresh collection ready")

# Get all markdown files
all_files = list(Path(BOOK_FOLDER).rglob("*.md")) + list(Path(BOOK_FOLDER).rglob("*.mdx"))

# Filter out Docusaurus template files
files = [
    f for f in all_files
    if not any(exclude in str(f) for exclude in ['tutorial-basics', 'tutorial-extras'])
]

logger.info(f"Found {len(all_files)} total files, {len(files)} after filtering")
logger.info(f"Excluded {len(all_files) - len(files)} template files")
print(f"Processing {len(files)} book files (excluded {len(all_files) - len(files)} template files)...")

def get_embedding(text: str, max_retries: int = 5):
    """Get embedding with retry logic. Raises exception if all retries fail."""
    for attempt in range(max_retries):
        try:
            vec = openai.embeddings.create(model="text-embedding-3-small", input=text).data[0].embedding
            return vec
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Failed to get embedding after {max_retries} attempts: {e}")
                raise
            logger.warning(f"Embedding attempt {attempt + 1} failed, retrying...")
            time.sleep(2)
    raise Exception("Failed to get embedding")

def upload_chunk(chunk_text: str, file_name: str, point_id: int, max_retries: int = 5):
    """Upload chunk to Qdrant with retry logic. Raises exception if all retries fail."""
    vec = get_embedding(chunk_text)
    for attempt in range(max_retries):
        try:
            client.upsert(COLLECTION_NAME, points=[PointStruct(
                id=point_id, 
                vector=vec, 
                payload={"text": chunk_text, "file": file_name}
            )])
            return True
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Failed to upload chunk {point_id} after {max_retries} attempts: {e}")
                raise
            logger.warning(f"Upload attempt {attempt + 1} failed for chunk {point_id}, retrying...")
            time.sleep(3)
    raise Exception("Failed to upload chunk")

point_id = 0
failed_chunks = []
files_processed = 0
chunks_per_file = {}

for file in tqdm(files, desc="Processing files"):
    try:
        text = file.read_text(encoding="utf-8")
        words = text.split()
        
        if not words:
            logger.warning(f"Skipping empty file: {file.name}")
            continue
        
        file_chunks = 0
        chunk = []
        
        for word in words:
            chunk.append(word)
            if len(chunk) >= 700:   # smaller chunks
                chunk_text = " ".join(chunk)
                try:
                    upload_chunk(chunk_text, file.name, point_id)
                    point_id += 1
                    file_chunks += 1
                except Exception as e:
                    logger.error(f"Failed to upload chunk from {file.name}: {e}")
                    failed_chunks.append((file.name, chunk_text[:100]))
                chunk = []

        # last chunk of file (even if small)
        if chunk:
            chunk_text = " ".join(chunk)
            try:
                upload_chunk(chunk_text, file.name, point_id)
                point_id += 1
                file_chunks += 1
            except Exception as e:
                logger.error(f"Failed to upload last chunk from {file.name}: {e}")
                failed_chunks.append((file.name, chunk_text[:100]))
        
        chunks_per_file[file.name] = file_chunks
        files_processed += 1
        
    except Exception as e:
        logger.error(f"Error processing file {file.name}: {e}")
        failed_chunks.append((file.name, f"File processing error: {e}"))

info = client.get_collection(COLLECTION_NAME)
print(f"\n{'='*60}")
print(f"SUCCESS! {info.points_count} chunks uploaded — RAG IS NOW LIVE!")
print(f"Files processed: {files_processed}/{len(files)}")
print(f"Failed chunks: {len(failed_chunks)}")
if failed_chunks:
    print("\nFailed chunks:")
    for file_name, error in failed_chunks[:10]:  # Show first 10
        print(f"  - {file_name}: {error}")
if len(failed_chunks) > 10:
    print(f"  ... and {len(failed_chunks) - 10} more")
print(f"{'='*60}")