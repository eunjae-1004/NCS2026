# 서버 실행 가이드

## 올바른 실행 방법

### 방법 1: npm 스크립트 사용 (권장)

```bash
# server 디렉토리로 이동
cd server

# 개발 모드 실행 (자동 재시작)
npm run dev

# 또는 프로덕션 모드 실행
npm start
```

### 방법 2: 직접 실행 (권장하지 않음)

```bash
cd server
node index.js
```

## 오류 해결

### 오류: "Cannot find module 'node'"

이 오류는 `node` 명령어를 잘못 실행했을 때 발생합니다.

**잘못된 실행:**
```bash
node  # ❌ 잘못됨
```

**올바른 실행:**
```bash
npm run dev  # ✅ 올바름
# 또는
node index.js  # ✅ 올바름
```

### Node.js 버전 확인

`--watch` 플래그는 Node.js 18.11.0 이상에서 지원됩니다.

```bash
node --version
```

Node.js 18 미만이면 `--watch` 대신 `nodemon`을 사용하세요:

```bash
npm install --save-dev nodemon
```

그리고 `package.json`의 `dev` 스크립트를:
```json
"dev": "nodemon index.js"
```

## 환경 변수 설정

서버를 실행하기 전에 `.env` 파일을 생성하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=NCS_2026
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
```

## 데이터베이스 연결 테스트

```bash
cd server
npm run test-db
```

## 실행 확인

서버가 정상적으로 시작되면:

```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
🚀 API 서버가 http://localhost:3000 에서 실행 중입니다
```

브라우저에서 확인:
- http://localhost:3000

## 문제 해결

1. **의존성 설치 확인:**
   ```bash
   cd server
   npm install
   ```

2. **포트 충돌:**
   - 포트 3000이 사용 중이면 `.env`에서 `PORT=3001`로 변경

3. **데이터베이스 연결 실패:**
   - `.env` 파일의 데이터베이스 설정 확인
   - PostgreSQL 서비스가 실행 중인지 확인


