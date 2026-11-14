@echo off
cd /d "%~dp0"
echo PORTADA OCULTA - V25: descarga de Leon, Sackboy, John Marston y otros personajes
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0descargar_siluetas.ps1"
pause
