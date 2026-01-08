# 배포 전 체크리스트

## ✅ 배포 전 확인 사항

### 1. 코드 준비
- [ ] 모든 변경사항 커밋 및 푸시 완료
- [ ] 린트 오류 없음
- [ ] TypeScript 컴파일 오류 없음
- [ ] 로컬에서 빌드 성공 (`npm run build`)

### 2. 데이터베이스 준비
- [ ] Railway PostgreSQL 데이터베이스 생성 완료
- [ ] `database/create_tables.sql` 실행 완료
- [ ] `database/migrate_improvements.sql` 실행 완료
- [ ] 테이블 구조 확인 완료
- [ ] 뷰 생성 확인 완료
- [ ] 트리거 생성 확인 완료

### 3. 환경 변수 준비

#### Railway (백엔드)
- [ ] `DATABASE_URL` 설정 (또는 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- [ ] `PORT=3000` 설정
- [ ] `NODE_ENV=production` 설정
- [ ] `ALLOWED_ORIGINS` 설정 (Vercel 도메인 포함)

#### Vercel (프론트엔드)
- [ ] `VITE_API_BASE_URL` 설정 (Railway 백엔드 URL)
- [ ] `VITE_USE_MOCK_DATA=false` 설정

### 4. CORS 설정
- [ ] `server/index.js`에서 Vercel 도메인 허용 확인
- [ ] 개발 환경(localhost) 허용 확인

### 5. 테스트
- [ ] 로컬에서 백엔드 API 테스트
- [ ] 로컬에서 프론트엔드 테스트
- [ ] 데이터베이스 연결 테스트

## 🚀 배포 순서

1. **Railway 백엔드 배포**
2. **Railway 백엔드 URL 확인**
3. **Vercel 프론트엔드 배포** (백엔드 URL 설정 후)
4. **배포 후 테스트**

## 📝 배포 후 확인

- [ ] Railway 백엔드 로그에서 데이터베이스 연결 성공 확인
- [ ] Railway 백엔드 Health Check 성공
- [ ] Vercel 프론트엔드 빌드 성공
- [ ] 프론트엔드에서 API 호출 성공
- [ ] CORS 오류 없음
- [ ] 추천 API 정상 작동
- [ ] 선택 이력 저장 정상 작동

