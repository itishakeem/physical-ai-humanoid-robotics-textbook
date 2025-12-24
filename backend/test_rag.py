#!/usr/bin/env python3
"""Test script to verify RAG functionality"""

import time
import logging
import embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_rag():
    print("\n" + "="*60)
    print("Testing RAG System")
    print("="*60)

    # Wait for Qdrant to connect (background thread)
    print("\nWaiting for Qdrant connection...")
    max_wait = 10
    waited = 0
    while not embeddings.qdrant and waited < max_wait:
        time.sleep(1)
        waited += 1
        print(f"  Waiting... ({waited}s)")

    if not embeddings.qdrant:
        print("\nERROR: Qdrant connection failed after 10 seconds")
        return False

    print("\nQdrant connected successfully!")

    # Test queries
    test_queries = [
        "What are the main components of a humanoid robot?",
        "How does a humanoid robot walk?",
        "What is inverse kinematics?"
    ]

    for i, query in enumerate(test_queries, 1):
        print(f"\n--- Test {i} ---")
        print(f"Query: {query}")

        results = embeddings.search_qdrant(query, top_k=3)

        if results:
            print(f"SUCCESS: Found {len(results)} results")
            for j, result in enumerate(results, 1):
                text = result.payload.get("text", "")
                preview = text[:150].replace('\n', ' ')
                print(f"  {j}. {preview}...")
        else:
            print("WARNING: No results found")

        time.sleep(0.5)  # Brief pause between queries

    print("\n" + "="*60)
    print("RAG Test Complete")
    print("="*60)
    return True

if __name__ == "__main__":
    test_rag()
