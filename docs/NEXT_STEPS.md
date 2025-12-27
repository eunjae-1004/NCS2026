# 다음 단계 가이드

## ✅ 현재 상태

- ✅ 데이터베이스 생성 완료
- ✅ 백엔드 API 서버 실행 중 (`http://localhost:3000`)
- ✅ API 엔드포인트 응답 확인

## 🔍 다음 단계

### 1. 데이터베이스 연결 확인

서버가 데이터베이스와 연결되었는지 확인:

```bash
# 브라우저에서 확인
http://localhost:3000/api/ability-units?keyword=품질
```

또는 PowerShell에서:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units?keyword=품질" | Select-Object -ExpandProperty Content
```

**예상 결과:**
- 데이터베이스 연결 성공 시: 실제 데이터베이스에서 조회한 능력단위 목록
- 데이터베이스 연결 실패 시: Mock 데이터 또는 빈 배열

### 2. 환경 변수 확인

`server/.env` 파일이 생성되었는지 확인:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=NCS_2026
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
```

### 3. 데이터베이스 연결 테스트

```bash
cd server
npm run test-db
```

이 명령어는 데이터베이스 연결 상태와 테이블 정보를 확인합니다.

### 4. 주요 API 엔드포인트 테스트

#### 능력단위 검색
```
http://localhost:3000/api/ability-units?keyword=품질
http://localhost:3000/api/ability-units?level=3
http://localhost:3000/api/ability-units?subCategoryCode=01010101
```

#### 능력단위 상세 조회 (KSA 포함)
```
http://localhost:3000/api/ability-units/[unit_code]
```
예: `http://localhost:3000/api/ability-units/0101010101_17v2`

#### 기관 목록
```
http://localhost:3000/api/organizations
```

#### 표준 코드 조회
```
http://localhost:3000/api/standard-codes/departments
http://localhost:3000/api/standard-codes/industries
http://localhost:3000/api/standard-codes/jobs
```

### 5. 프론트엔드 연동

프론트엔드에서 실제 API를 사용하도록 설정:

#### `.env` 파일 생성 (프로젝트 루트)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

#### 프론트엔드 재시작

```bash
npm run dev
```

### 6. 전체 시스템 테스트

1. **검색 기능 테스트**
   - 키워드 검색
   - 필터 검색 (레벨, 분류 등)

2. **상세 페이지 테스트**
   - 능력단위 상세 정보
   - KSA (지식/기술/태도) 데이터 표시
   - 수행준거 표시

3. **장바구니 기능 테스트**
   - 능력단위 추가
   - 세트 저장

4. **추천 기능 테스트**
   - 산업/부서별 추천

## 🐛 문제 해결

### 데이터베이스 연결 실패

서버 콘솔에 다음 메시지가 표시되면:
```
⚠️ 데이터베이스 연결 실패. Mock 데이터 모드로 동작합니다.
```

**해결 방법:**
1. `.env` 파일 확인
2. PostgreSQL 서비스 실행 확인
3. 데이터베이스 이름 확인 (`NCS_2026`)
4. 사용자 권한 확인

### API가 빈 데이터 반환

**확인 사항:**
1. 데이터베이스에 데이터가 import되었는지 확인
2. 테이블 이름이 올바른지 확인
3. 서버 콘솔의 오류 메시지 확인

### 프론트엔드에서 API 호출 실패

**확인 사항:**
1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 `VITE_API_BASE_URL` 확인
3. CORS 설정 확인 (이미 설정되어 있음)

## 📊 확인 체크리스트

- [ ] 백엔드 서버 실행 중 (`http://localhost:3000`)
- [ ] 데이터베이스 연결 성공 (서버 콘솔 확인)
- [ ] API 엔드포인트 응답 확인
- [ ] 데이터베이스에 데이터 import 완료
- [ ] 프론트엔드 `.env` 파일 설정
- [ ] 프론트엔드에서 실제 API 사용 확인

## 🎯 완료 기준

다음이 모두 작동하면 준비 완료:

1. ✅ 백엔드 API 서버 실행 중
2. ✅ 데이터베이스 연결 성공
3. ✅ API 엔드포인트가 실제 데이터 반환
4. ✅ 프론트엔드에서 검색 기능 작동
5. ✅ 상세 페이지에서 KSA 데이터 표시

## 📚 참고 문서

- `database/SETUP_BACKEND_CONNECTION.md` - 데이터베이스 연결 설정
- `server/RUN_SERVER.md` - 서버 실행 가이드
- `API_DOCUMENTATION.md` - API 문서
- `TESTING_GUIDE.md` - 테스트 가이드
