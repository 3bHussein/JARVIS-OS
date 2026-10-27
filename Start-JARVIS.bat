@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ then run Setup-JARVIS.bat.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24){console.error('Node.js 24 or newer is required.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
node scripts\start.mjs %*
if errorlevel 1 (
  echo Startup failed. Read the message above.
  pause
  exit /b 1
)
