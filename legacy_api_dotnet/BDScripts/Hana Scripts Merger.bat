@echo off

setlocal enableextensions enabledelayedexpansion

echo.
echo *****************************************************************************
echo *****************************************************************************
echo Debe crear una carpeta con el nombre de SAP y ahi exportar los SCRIPT DE HANA
echo Al final del proceso se elimina la carpeta SAP y su contenido.
echo Cierre la consola y respalde su trabajo si no tiene seguridad.
echo ****************************************************************************
echo ****************************************************************************
echo.
echo Working directory; %cd%
echo.
 
set /a count = 1
set /a selectedDatabase = none

:: Creates menu
for /f %%i in (_scriptsNames) do (
	@echo !count! - %%i

	set /a count += 1
)

:: Reads user selection
echo. 
set /p userOption="Script output name: "
echo.
set /a count = 1
set "scriptFile=no_db_selected"

:: Gets script name from file base on user selection
for /f %%i in (_scriptsNames) do (

	if %userOption%==!count! set "scriptFile=HANA_%%i.sql"

	set /a count += 1
)

:: Dummy validations to avoid not found script name
if %scriptFile%==no_db_selected echo Unknown script name, please check your script name definitions. Runtime exception!
if %scriptFile%==no_db_selected pause
if %scriptFile%==no_db_selected goto :eof

:: Used as a buffer flush
type _buffer > "!scriptFile!"

for /r "." %%a in (*.sql) do (

	type %%a >> "!scriptFile!"

	echo. >> "!scriptFile!"

	echo. >> "!scriptFile!"

	@echo %%a
)

:: Delets export folder
rd /s /q "%cd%"\SAP

endlocal

echo.
echo ***********************************HANA SCRIPTS MERGER v2***********************************

pause