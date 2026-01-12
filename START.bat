@echo off
echo ========================================
echo AIMate - Starting Application
echo ========================================
echo.
echo Starting Backend Server...
start "AIMate Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Client...
start "AIMate Frontend" cmd /k "cd client && npm start"
echo.
echo ========================================
echo Both servers should be starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
pause

