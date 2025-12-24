import os
import re
from typing import List

# ----------------------------
# CLEAN MARKDOWN TEXT
# ----------------------------

def clean_markdown(text: str) -> str:
    """
    Removes markdown formatting, code blocks, images, links, and keeps clean text.
    """
    # Remove code blocks
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)

    # Remove inline code
    text = re.sub(r"`.*?`", "", text)

    # Remove images ![alt](url)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)

    # Remove links [text](url)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)

    # Remove markdown headers ###, ##, #
    text = re.sub(r"#{1,6}\s*", "", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ----------------------------
# LOAD ALL MARKDOWN FILES
# ----------------------------

def load_markdown_files(folder_path: str) -> List[str]:
    """
    Loads all .md & .mdx files and returns cleaned text.
    """
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".md") or file.endswith(".mdx"):
                full_path = os.path.join(root, file)

                print(f"Found file: {full_path}")
                with open(full_path, "r", encoding="utf-8") as f:
                    raw_text = f.read()
                print(f"Raw text length: {len(raw_text)}")
                cleaned = clean_markdown(raw_text)
                print(f"Cleaned text length: {len(cleaned)}")
                if not cleaned:
                    print(f"WARNING: Cleaned text is empty for {full_path}")
                yield cleaned


# ----------------------------
# CHUNK SPLITTING
# ----------------------------

def split_into_chunks(text_list: List[str], chunk_size: int = 1000, overlap: int = 100):
    """
    Splits large text blobs into embed-friendly chunks, yielding them one by one.
    """
    for text in text_list:
        start = 0
        length = len(text)

        while start < length:
            end = min(start + chunk_size, length)
            chunk = text[start:end]
            yield chunk
            start = end - overlap
