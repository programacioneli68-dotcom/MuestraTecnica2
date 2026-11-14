@echo off
cd /d "%~dp0"
echo PORTADA OCULTA - V24: descarga y actualizacion de portadas locales
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0descargar_portadas.ps1"
pause
