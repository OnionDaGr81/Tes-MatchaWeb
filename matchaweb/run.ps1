# =============================================
# run.ps1 - Script untuk build & run MatchaWeb
# Cara pakai: .\run.ps1  (dari PowerShell)
# =============================================

$JAR = "D:\Tes-MatchaWeb\matchaweb\target\matchaweb-1.0-SNAPSHOT-jar-with-dependencies.jar"
$MVN = "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
$POM = "D:\Tes-MatchaWeb\matchaweb\pom.xml"

Write-Host "==> [1/3] Menghentikan server lama..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "    OK." -ForegroundColor Green

Write-Host "`n==> [2/3] Build project..." -ForegroundColor Yellow
& $MVN clean package --no-transfer-progress -f $POM
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Build gagal! Periksa error di atas." -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
Write-Host "    Build sukses!" -ForegroundColor Green

Write-Host "`n==> [3/3] Menjalankan server di http://localhost:7070 ..." -ForegroundColor Yellow
Write-Host "    Tekan Ctrl+C untuk menghentikan server.`n" -ForegroundColor Gray
java -jar $JAR
