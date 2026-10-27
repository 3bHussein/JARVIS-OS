@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ then reopen this file.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24){console.error('Node.js 24 or newer is required.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
node scripts\setup.mjs %*
set "JARVIS_EXIT=%ERRORLEVEL%"
if not "%~1"=="--help" pause
exit /b %JARVIS_EXIT%
