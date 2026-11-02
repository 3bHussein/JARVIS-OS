@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
if "%~1"=="--help" (
  echo Optional native window: requires the Windows Desktop Preview artifact and an existing runtime started with step 02.
  echo This host does not start or stop the service. --probe checks only the fixed local health endpoint.
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
start "" "%~dp0JARVIS-OS-Desktop.exe"
