# 환경 변수 설정 가이드

## 실제 API 사용 설정

프론트엔드에서 실제 API 서버를 사용하도록 설정하려면:

### 1. 프로젝트 루트에 `.env` 파일 생성

프로젝트 루트 디렉토리 (`D:\Website\cursor\ncssearch2026`)에 `.env` 파일을 만들고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### 2. 프론트엔드 서버 재시작

환경 변수 변경 후에는 반드시 프론트엔드 서버를 재시작해야 합니다:

1. 현재 실행 중인 서버 중지 (Ctrl+C)
2. 다시 실행: `npm run dev`

### 3. 확인 방법

브라우저 개발자 도구 (F12) → Network 탭에서:
- 검색 시 `http://localhost:3000/api/ability-units`로 요청이 전송되는지 확인
- Mock 데이터가 아닌 실제 API 서버로 요청이 가는지 확인

## 현재 상태

- **API 서버**: ✅ 실행 중 (`http://localhost:3000`)
- **프론트엔드 서버**: ✅ 실행 중 (`http://localhost:5173`)
- **환경 변수**: ⚠️ `.env` 파일 필요 (수동 생성)

## Mock 데이터 모드 (기본값)

`.env` 파일이 없거나 `VITE_USE_MOCK_DATA=true`인 경우:
- 프론트엔드 내부의 Mock 데이터 사용
- API 서버 없이도 동작 가능
- 개발/테스트용

## 실제 API 모드

`.env` 파일에 `VITE_USE_MOCK_DATA=false` 설정 시:
- 실제 API 서버로 요청 전송
- 데이터베이스 연동 가능
- 프로덕션 환경용


