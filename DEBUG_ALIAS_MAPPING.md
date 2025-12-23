# 별칭 매핑 디버깅 가이드

## 문제 진단

브라우저 개발자 도구(F12)를 열고 Console 탭에서 다음을 확인하세요:

### 1. 표준 코드 로드 확인

다음 메시지가 표시되어야 합니다:
```
표준 코드 로드됨: departments ["품질관리", "생산관리", ...]
```

표시되지 않으면:
- API 서버가 실행 중인지 확인
- `http://localhost:3000/api/standard-codes/departments` 접속하여 응답 확인

### 2. 매핑 결과 확인

검색어를 입력하면 다음 메시지가 표시되어야 합니다:
```
매핑 결과: {input: "품질", standard: "...", confidence: 0.5, candidates: [...]}
```

### 3. 후보 표시 확인

메시지 아래에 후보 버튼이 표시되어야 합니다. Console에서:
```
후보 표시: {candidates: [...], standardCodesList: [...], ...}
```

## 수동 테스트

### API 직접 테스트

브라우저에서 다음 URL을 테스트:

```
http://localhost:3000/api/standard-codes/departments
http://localhost:3000/api/standard-codes/industries
http://localhost:3000/api/standard-codes/jobs
```

### 별칭 매핑 API 테스트

PowerShell에서:
```powershell
$body = @{
    input = "품질"
    type = "department"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/alias/map" -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

## 해결 방법

### 표준 코드가 로드되지 않음

1. 백엔드 서버 실행 확인
2. 데이터베이스에 `standard_codes` 테이블 데이터 확인
3. API 엔드포인트 응답 확인

### candidates가 없음

1. 별칭 매핑 API 응답 확인
2. 데이터베이스에 `alias_mapping` 테이블 데이터 확인
3. 표준 코드 목록이 자동으로 사용되는지 확인

### 버튼이 표시되지 않음

1. Console에서 "후보 표시" 로그 확인
2. `candidates.length > 0`인지 확인
3. 브라우저 새로고침 (Ctrl+Shift+R)


