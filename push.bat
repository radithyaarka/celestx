@echo off
echo STARTING LAZY PUSH...

:: 1. Add all changes
echo STAGING CHANGES...
git add .

:: 2. Ask for a commit message
echo.
set /p msg="ENTER COMMIT MESSAGE (OR PRESS ENTER FOR 'UPDATE'): "
if "%msg%"=="" set msg=update

:: 3. Commit
echo COMMITTING CHANGES...
git commit -m "%msg%"

:: 4. Push
echo PUSHING TO GITHUB...
git push origin main

echo.
echo DONE! YOUR CODE IS LIVE.
pause
