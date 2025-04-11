@echo off
echo === Generador de indices de recursos ===
echo.

REM Verificar si Python esta instalado
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Ejecutando script de Python...
    python tools/generate_resource_indexes.py --verbose
    goto :end
)

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Ejecutando script de Node.js...
    node tools/generate_resource_indexes.js --verbose
    goto :end
)

echo Error: No se encontro Python ni Node.js.
echo Por favor, instale Python o Node.js para ejecutar este script.

:end
echo.
echo Presione cualquier tecla para salir...
pause >nul
