@echo off
echo 🚀 Starting AutoPlac AI - Full Stack Setup
echo ==========================================

echo.
echo 📦 Installing backend dependencies...
cd app
pip install -r requirements.txt
cd ..

echo.
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo 🗄️  Setting up database tables...
cd app
python database.py
cd ..

echo.
echo ✅ Setup complete! Starting servers...
echo ==========================================
echo.

echo 🌐 Starting FastAPI backend (http://localhost:8000)
start cmd /k "cd app && uvicorn main:app --reload --host 0.0.0.0"

echo.
echo ⚛️  Starting React frontend (http://localhost:3000)
start cmd /k "cd frontend && npm run dev"

echo.
echo 🎉 Both servers are starting up!
echo - Backend API: http://localhost:8000
echo - Frontend App: http://localhost:3000
echo - API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop either server
pause
