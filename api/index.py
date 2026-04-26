import sys
import os

# Add the backend directory to the Python path
# This allows relative imports inside backend/server.py to work properly on Vercel
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.server import app
