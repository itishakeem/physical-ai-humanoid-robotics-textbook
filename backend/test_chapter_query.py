"""
Test script to verify chapter query retrieval
Tests if "summarize chapter 2" returns actual book content instead of Docusaurus templates
"""
import time
from embeddings import search_qdrant

print("="*70)
print("Testing RAG Retrieval: 'summarize chapter 2'")
print("="*70)

print("Waiting for Qdrant connection...")
time.sleep(3)  # Give time for async connection

results = search_qdrant("summarize chapter 2", top_k=15)

print(f"\nFound {len(results)} results\n")

if len(results) == 0:
    print("ERROR: No results found!")
    print("This means the Qdrant collection is empty or not accessible.")
else:
    print("Top 5 Results:")
    print("-" * 70)

    for i, r in enumerate(results[:5]):
        text = r.payload.get("text", "").encode('ascii', errors='ignore').decode('ascii')
        file = r.payload.get("file", "unknown")

        print(f"\nResult {i+1}:")
        print(f"  File: {file}")
        print(f"  Score: {r.score if hasattr(r, 'score') else 'N/A'}")
        print(f"  Text preview: {text[:200]}...")

        # Check for template contamination
        if "tutorial-basics" in file or "tutorial-extras" in file or "Docusaurus" in text:
            print(f"  [WARNING] Template file detected!")
        else:
            print(f"  [OK] Book content detected")

    print("\n" + "="*70)
    print("Summary:")
    print("="*70)

    template_files = [r for r in results if "tutorial" in r.payload.get("file", "").lower()]
    book_files = [r for r in results if "chapter" in r.payload.get("file", "").lower()]

    print(f"Total results: {len(results)}")
    print(f"Book chapter files: {len(book_files)}")
    print(f"Template files: {len(template_files)}")

    if template_files:
        print(f"\n[PROBLEM] {len(template_files)} template files found in results!")
        print("Template files should be excluded from indexing.")
    else:
        print(f"\n[SUCCESS] No template files found in results!")
        print("All results are from actual book chapters.")
