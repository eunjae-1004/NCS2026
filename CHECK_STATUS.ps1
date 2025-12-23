# 서버 상태 확인 스크립트

Write-Host "=== 서버 상태 확인 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Node 프로세스 확인
Write-Host "1. Node 프로세스 확인:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Select-Object Id, ProcessName, StartTime | Format-Table
    Write-Host "✅ Node 프로세스 실행 중: $($nodeProcesses.Count)개" -ForegroundColor Green
} else {
    Write-Host "❌ Node 프로세스가 실행되지 않음" -ForegroundColor Red
}
Write-Host ""

# 2. 포트 확인
Write-Host "2. 포트 확인:" -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
$port5173 = netstat -ano | findstr ":5173" | findstr "LISTENING"

if ($port3000) {
    Write-Host "✅ 포트 3000 (API 서버) 리스닝 중" -ForegroundColor Green
    Write-Host "   $port3000" -ForegroundColor Gray
} else {
    Write-Host "❌ 포트 3000 (API 서버) 리스닝 안 됨" -ForegroundColor Red
}

if ($port5173) {
    Write-Host "✅ 포트 5173 (프론트엔드) 리스닝 중" -ForegroundColor Green
    Write-Host "   $port5173" -ForegroundColor Gray
} else {
    Write-Host "❌ 포트 5173 (프론트엔드) 리스닝 안 됨" -ForegroundColor Red
}
Write-Host ""

# 3. API 서버 테스트
Write-Host "3. API 서버 테스트:" -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri http://localhost:3000 -ErrorAction Stop
    Write-Host "✅ API 서버 정상 작동" -ForegroundColor Green
    Write-Host "   응답: $($apiResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API 서버 응답 없음" -ForegroundColor Red
    Write-Host "   에러: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# 4. 프론트엔드 테스트
Write-Host "4. 프론트엔드 테스트:" -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ 프론트엔드 서버 정상 작동" -ForegroundColor Green
    Write-Host "   상태 코드: $($frontendResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 프론트엔드 서버 응답 없음" -ForegroundColor Red
    Write-Host "   에러: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# 5. 요약
Write-Host "=== 요약 ===" -ForegroundColor Cyan
if ($port3000 -and $port5173) {
    Write-Host "✅ 모든 서버가 정상 실행 중입니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "브라우저에서 다음 주소로 접속하세요:" -ForegroundColor Yellow
    Write-Host "  프론트엔드: http://localhost:5173" -ForegroundColor White
    Write-Host "  API 서버: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "⚠️ 일부 서버가 실행되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "서버 실행 방법:" -ForegroundColor Yellow
    Write-Host "  1. API 서버: cd server && node index.js" -ForegroundColor White
    Write-Host "  2. 프론트엔드: npm run dev" -ForegroundColor White
}
