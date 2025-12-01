import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from routers import users, oglasi, vozila, admin

app = FastAPI(title="AutoPlac AI", version="1.0.0")

# Get the base directory path
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the static files directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],  # React dev server and FastAPI
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

# Include all routers
app.include_router(users.router)
app.include_router(oglasi.router)
app.include_router(vozila.router)
app.include_router(admin.router)

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "AutoPlac AI"})

@app.get("/api/")
def api_info():
    return {
        "message": "AutoPlac AI API",
        "version": "1.0.0",
        "endpoints": {
            "users": "/users/",
            "auth": {
                "login": "/auth/login",
                "register": "/auth/register",
                "me": "/auth/me"
            },
            "advertisements": "/oglasi/",
            "vehicles": "/vozila/"
        }
    }