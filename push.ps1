# celestx. lazy push script

Write-Host "🚀 starting the lazy push sequence..." -ForegroundColor Cyan

# 1. Add all changes
Write-Host "📦 staging changes..." -ForegroundColor Yellow
git add .

# 2. Ask for a commit message
$msg = Read-Host "💬 enter commit message (or press enter for 'update')"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "update" }

# 3. Commit
Write-Host "💾 committing changes..." -ForegroundColor Yellow
git commit -m "$msg"

# 4. Push
Write-Host "📤 pushing to github..." -ForegroundColor Green
git push origin main

Write-Host "✅ done! your code is live." -ForegroundColor Cyan
