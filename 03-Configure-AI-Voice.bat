@echo off
setlocal
call "%~dp0Configure-JARVIS.bat" %*
exit /b %ERRORLEVEL%
