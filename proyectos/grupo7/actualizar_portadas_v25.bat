@echo off
cd /d "%~dp0"
echo PORTADA OCULTA - V25: actualizacion de Zelda BOTW, Astro Bot y Sackboy
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0descargar_portadas.ps1" -ActualizarSeleccionadas
pause
