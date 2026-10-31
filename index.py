"""Vercel entrypoint for the FastAPI app.

Vercel detects a module-level FastAPI instance named ``app`` in index.py.
The application implementation lives in backend/app, so add it to sys.path
before importing. Local development keeps using ``uvicorn app.main:app``.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "backend"))

from app.main import app  # noqa: E402,F401

__all__ = ["app"]
