@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
if "%~1"=="--help" (
  echo Optional native window: requires the Windows Desktop Preview artifact. Starts its own local service.
  echo Use --attach if step 02 is already running. --probe checks the fixed local health endpoint.
  exit /b 0
)
if not exist "%~dp0JARVIS-OS-Desktop.exe" (
  echo Native EXE is not included in this source or browser-only copy.
  echo Download the JARVIS-OS-Windows-Desktop-Preview artifact, or keep using step 02 in your browser.
  pause
  exit /b 1
)
if "%~1"=="--probe" (
  "%~dp0JARVIS-OS-Desktop.exe" --probe
  exit /b !ERRORLEVEL!
)
if "%~1"=="--attach" (
  start "" "%~dp0JARVIS-OS-Desktop.exe"
  exit /b 0
)
node "%~dp0scripts/start-desktop.mjs"
if errorlevel 1 (
  pause
  exit /b 1
)
