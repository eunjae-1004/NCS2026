# GitHub 업로드 체크리스트

## ✅ 완료된 정리 작업

### 1. .gitignore 업데이트
- ✅ `node_modules/` 제외
- ✅ `dist/` 제외
- ✅ `.env*` 파일 제외
- ✅ 로그 파일 제외
- ✅ OS 파일 제외
- ✅ 빌드 결과물 제외

### 2. 문서 파일 정리
- ✅ 트러블슈팅 문서 → `docs/` 폴더로 이동
- ✅ 문제 해결 가이드 → `docs/` 폴더로 이동
- ✅ 핵심 문서만 루트에 유지

### 3. 불필요한 파일 삭제
- ✅ 마이그레이션 파일들 (이미 통합됨)
- ✅ 중복된 SQL 파일들

## 📁 최종 프로젝트 구조

```
ncssearch2026/
├── src/                    # 프론트엔드 소스
├── server/                 # 백엔드 서버
├── database/               # DB 스크립트
│   ├── create_tables.sql   # 테이블 생성 (핵심)
│   ├── init.sql            # 초기 데이터 (핵심)
│   ├── cleanup_*.sql       # 정리 스크립트
│   └── import_csv_guide.sql # CSV 가이드
├── docs/                   # 문서 모음
│   └── README.md           # 문서 인덱스
├── README.md               # 프로젝트 메인 문서
├── DEPLOYMENT_GUIDE.md     # 배포 가이드
├── QUICK_START.md          # 빠른 시작
├── API_DOCUMENTATION.md    # API 문서
├── .gitignore              # Git 제외 파일
├── package.json
├── vite.config.ts
└── vercel.json
```

## 🚫 GitHub에 업로드되지 않는 파일들

다음 파일들은 `.gitignore`에 의해 자동으로 제외됩니다:

- `node_modules/` - npm 패키지
- `dist/` - 빌드 결과물
- `.env*` - 환경 변수 파일
- `*.log` - 로그 파일
- `.DS_Store`, `Thumbs.db` - OS 파일

## 📤 GitHub 업로드 전 확인사항

### 필수 확인
- [ ] `.gitignore` 파일이 올바르게 설정되어 있는가?
- [ ] 환경 변수 파일 (`.env`)이 제외되는가?
- [ ] `node_modules/` 폴더가 제외되는가?
- [ ] `dist/` 폴더가 제외되는가?
- [ ] 민감한 정보가 코드에 포함되지 않았는가?

### 선택 확인
- [ ] `docs/` 폴더의 문서들이 필요한가? (필요 없으면 제외 가능)
- [ ] `database/cleanup_*.sql` 파일들이 필요한가?

## 📝 Git 명령어

### 첫 업로드

```bash
# 변경사항 확인
git status

# 변경사항 추가
git add .

# 커밋
git commit -m "Initial commit: NCS 검색 시스템"

# GitHub에 푸시
git push origin main
```

### docs 폴더 제외하고 싶다면

`.gitignore`에 추가:
```
docs/
```

## ⚠️ 주의사항

1. **환경 변수 파일**
   - `.env` 파일은 절대 커밋하지 마세요
   - `env.example` 파일만 커밋하세요

2. **민감한 정보**
   - API 키, 비밀번호 등이 코드에 포함되지 않았는지 확인
   - Railway, Vercel URL은 환경 변수로 관리

3. **빌드 결과물**
   - `dist/` 폴더는 배포 시 자동 생성되므로 커밋 불필요

## 완료 확인

다음 명령어로 제외될 파일 확인:

```bash
git status --ignored
```

제외된 파일들이 표시되면 정상입니다!


