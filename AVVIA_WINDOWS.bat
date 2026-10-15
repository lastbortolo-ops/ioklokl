@echo off
where node >nul 2>nul
if %errorlevel% neq 0 (
 echo Installa Node.js LTS da https://nodejs.org e riprova.
 pause
 exit /b
)
call npm install
start http://localhost:3000
npm start
