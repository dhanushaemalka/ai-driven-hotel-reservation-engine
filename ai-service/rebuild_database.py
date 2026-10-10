"""
Rebuild ChromaDB database with Cloudy Hill Cottage knowledge base
Run this script after updating any documents in data/docs/
"""

import os
import shutil
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma")
DATA_PATH = os.path.join(BASE_DIR, "data", "docs")


def load_documents():
    """Load all markdown documents from data/docs"""
    loader = DirectoryLoader(DATA_PATH, glob="**/*.md", show_progress=True)
    documents = loader.load()
    print(f"[OK] Loaded {len(documents)} documents")
    return documents


def split_documents(documents):
    """Split documents into chunks for embedding"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"[OK] Split into {len(chunks)} chunks")
    return chunks


def save_to_chroma(chunks):
    """Save document chunks to ChromaDB"""
    # Clear existing database
    if os.path.exists(CHROMA_PATH):
        print("[INFO] Clearing existing database...")
        shutil.rmtree(CHROMA_PATH)
    
    # Create embeddings
    print("[INFO] Creating embeddings (this may take a moment)...")
    embedding_function = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Create Chroma database
    db = Chroma.from_documents(
        chunks,
        embedding_function,
        persist_directory=CHROMA_PATH
    )
    
    print(f"[OK] Saved {len(chunks)} chunks to ChromaDB at {CHROMA_PATH}")
    return db


def main():
    print("\n" + "=" * 60)
    print("  CLOUDY HILL COTTAGE - KNOWLEDGE BASE BUILDER")
    print("=" * 60 + "\n")
    
    # Load documents
    documents = load_documents()
    
    if not documents:
        print("[ERROR] No documents found! Please add .md files to data/docs/")
        return
    
    # Split into chunks
    chunks = split_documents(documents)
    
    # Save to ChromaDB
    save_to_chroma(chunks)
    
    print("\n[SUCCESS] Database rebuilt successfully!")
    print("   You can now run: python api_server.py")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
