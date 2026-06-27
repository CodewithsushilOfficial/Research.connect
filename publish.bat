@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   Research-Connect Git Initialization ^& Publish
echo ===================================================
echo.

:: 1. Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH. Please install Git and try again.
    pause
    exit /b 1
)

:: 2. Initialize Git repo if it isn't already
if not exist .git (
    echo [INFO] Initializing new Git repository...
    git init
) else (
    echo [INFO] Git repository already initialized.
)

:: 3. Add and commit files
echo [INFO] Adding files to Git staging...
git add .

echo [INFO] Committing changes...
git commit -m "Initial commit: Set up Frontend and Backend directories"

:: 4. Check if remote exists
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "delims=" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    echo [INFO] Existing remote found: !REMOTE_URL!
    echo.
    echo Pushing to existing remote...
    git branch -M main
    git push -u origin main
) else (
    echo [INFO] No Git remote 'origin' found.
    echo.
    echo How would you like to set up the GitHub repository?
    echo [1] Create a new repository using GitHub CLI (gh CLI must be logged in)
    echo [2] Link an existing GitHub repository URL
    echo [3] Exit and push manually later
    echo.
    set /p CHOICE="Enter your choice (1, 2, or 3): "

    if "!CHOICE!"=="1" (
        where gh >nul 2>nul
        if !ERRORLEVEL! neq 0 (
            echo [ERROR] GitHub CLI (gh) is not installed. Please install it or use option 2.
            pause
            exit /b 1
        )
        echo Creating GitHub repository...
        gh repo create Research-Connect --public --source=. --push
    ) else if "!CHOICE!"=="2" (
        set /p REPO_URL="Enter the GitHub Repository URL (e.g. https://github.com/username/Research-Connect.git): "
        if not "!REPO_URL!"=="" (
            git remote add origin !REPO_URL!
            git branch -M main
            echo Pushing to !REPO_URL!...
            git push -u origin main
        ) else (
            echo Invalid URL. Exiting.
        )
    ) else (
        echo Exiting. You can push your changes manually using:
        echo   git remote add origin ^<your-repo-url^>
        echo   git branch -M main
        echo   git push -u origin main
    )
)

echo.
echo ===================================================
echo Done! Feel free to delete this publish.bat file.
echo ===================================================
pause
