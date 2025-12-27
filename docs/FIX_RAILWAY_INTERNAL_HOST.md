# Railway Internal Host 문제 해결

## 문제: `postgres.railway.internal`은 외부 접속 불가

`postgres.railway.internal`은 Railway의 **내부 네트워크 주소**입니다. 이 주소는 Railway 내부 서비스 간 통신에만 사용되며, pgAdmin4 같은 외부 클라이언트에서는 사용할 수 없습니다.

## 해결 방법: Public Networking 활성화

### 1단계: Railway에서 Public Networking 활성화

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 선택

2. **PostgreSQL 서비스 선택**
   - 프로젝트에서 PostgreSQL 서비스 클릭

3. **Settings 탭으로 이동**
   - 상단 메뉴에서 "Settings" 클릭

4. **Networking 섹션 찾기**
   - "Networking" 또는 "Public Networking" 섹션 확인

5. **Public Networking 활성화**
   - "Generate Domain" 버튼 클릭
   - 또는 "Public Networking" 토글을 ON으로 변경

6. **생성된 Public 도메인 확인**
   - 예: `containers-us-west-123.railway.app`
   - 예: `postgres-production.up.railway.app`
   - 이 도메인을 복사하세요

### 2단계: Variables에서 Public Host 확인

1. **Variables 탭으로 이동**
   - PostgreSQL 서비스 → Variables

2. **Public Host 확인**
   - `PGHOST` 값이 `postgres.railway.internal`에서
   - `containers-us-west-xxx.railway.app` 같은 Public 도메인으로 변경되었는지 확인
   - 또는 새로운 변수 `PUBLIC_HOST` 또는 `PUBLIC_URL` 확인

3. **Public 도메인 복사**
   - Public 도메인을 정확히 복사

### 3단계: pgAdmin4에서 Public 도메인 사용

1. **서버 Properties 열기**
   - pgAdmin4에서 서버 우클릭 → "Properties"

2. **Connection 탭 수정**
   - **Host name/address**: Public 도메인 입력
     - 예: `containers-us-west-123.railway.app`
     - ❌ `postgres.railway.internal` 사용하지 않기
   - **Port**: `5432` (변경 없음)
   - **Database**: `railway` (또는 `PGDATABASE` 값)
   - **Username**: `postgres` (또는 `PGUSER` 값)
   - **Password**: Railway의 `PGPASSWORD` 값

3. **SSL 탭 확인**
   - **SSL mode**: `Require` 또는 `Prefer`

4. **Save 후 연결 시도**

## Public Networking이 보이지 않는 경우

### 방법 1: Railway CLI로 터널링 (대안)

Public Networking을 활성화할 수 없는 경우:

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# PostgreSQL 터널링 (로컬 포트 5432로 연결)
railway connect postgres
```

이 명령어는 로컬 포트를 Railway PostgreSQL로 터널링합니다.

그러면 pgAdmin4에서:
- **Host**: `localhost` 또는 `127.0.0.1`
- **Port**: `5432` (터널링된 포트)
- **Database**: `railway`
- **Username**: `postgres`
- **Password**: Railway의 `PGPASSWORD`

### 방법 2: Railway Connect 탭 확인

1. **PostgreSQL 서비스 → "Connect" 탭**
2. **"psql" 또는 "Connection String" 확인**
3. **제공되는 Public 연결 정보 사용**

## 확인 체크리스트

- [ ] Railway PostgreSQL Settings에서 Public Networking 활성화
- [ ] Public 도메인 생성 확인 (예: `containers-us-west-xxx.railway.app`)
- [ ] pgAdmin4 Host에 Public 도메인 입력 (internal 주소 아님)
- [ ] SSL mode 설정 (`Require` 또는 `Prefer`)
- [ ] 연결 테스트 성공

## 주의사항

### Internal vs Public 주소

- **`postgres.railway.internal`**: 
  - Railway 내부 서비스 간 통신 전용
  - 외부 클라이언트에서 사용 불가
  - 백엔드 서비스에서 사용 가능

- **`containers-us-west-xxx.railway.app`**:
  - Public 도메인
  - 외부 클라이언트(pgAdmin4)에서 사용 가능
  - Public Networking 활성화 필요

### 백엔드 서비스 설정

백엔드 서비스는 `postgres.railway.internal`을 사용해도 됩니다:
- Railway 내부 네트워크이므로 작동함
- 더 빠른 연결 가능

하지만 pgAdmin4는 반드시 Public 도메인을 사용해야 합니다.

## 여전히 안 되면

1. **Railway 지원팀에 문의**
   - Public Networking 활성화가 안 되는 경우

2. **Railway CLI 터널링 사용**
   - 위의 "방법 1: Railway CLI로 터널링" 참고

3. **다른 클라이언트 시도**
   - DBeaver
   - TablePlus
   - DataGrip



