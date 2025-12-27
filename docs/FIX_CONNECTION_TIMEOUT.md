# Railway PostgreSQL 연결 타임아웃 해결

## 오류: "connection timeout expired"

이 오류는 Public Networking이 활성화되어 있어도 네트워크나 방화벽 문제로 발생할 수 있습니다.

## 해결 방법 1: Railway CLI 터널링 (가장 확실한 방법) ⭐

Railway CLI를 사용하여 로컬 터널을 만들면 방화벽 문제를 우회할 수 있습니다.

### 1단계: Railway CLI 설치 및 설정

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인 (브라우저가 열림)
railway login

# 프로젝트 연결
railway link
# 프로젝트를 선택하라는 메시지가 나오면 선택
```

### 2단계: PostgreSQL 터널링

```bash
# PostgreSQL 터널링 시작
railway connect postgres
```

이 명령어는:
- 로컬 포트를 Railway PostgreSQL로 터널링합니다
- 보통 `localhost:5432`로 연결됩니다
- 터널이 유지되는 동안 터미널을 열어두어야 합니다

### 3단계: pgAdmin4에서 localhost로 연결

터널링이 시작되면 pgAdmin4에서:

1. **서버 Properties 열기**
   - 서버 우클릭 → "Properties"

2. **Connection 탭 설정**
   - **Host name/address**: `localhost` 또는 `127.0.0.1`
   - **Port**: `5432` (터널링된 포트)
   - **Maintenance database**: `railway`
   - **Username**: `postgres`
   - **Password**: Railway의 `PGPASSWORD` 값

3. **SSL 탭 설정**
   - **SSL mode**: `Prefer` 또는 `Allow` (터널링을 통해 연결하므로 SSL이 필수는 아님)

4. **Save 후 연결 시도**

### 4단계: 터널 유지

- `railway connect postgres` 명령어를 실행한 터미널을 **열어두어야** 합니다
- 터미널을 닫으면 터널이 끊어집니다
- 필요할 때마다 다시 실행하면 됩니다

## 해결 방법 2: Public Networking 재확인

### 1. Public 도메인 확인

1. **PostgreSQL 서비스 → Settings → Networking**
2. **Public 도메인이 생성되었는지 확인**
3. **도메인 형식 확인:**
   - ✅ 올바른 형식: `containers-us-west-xxx.railway.app`
   - ✅ 올바른 형식: `xxx.up.railway.app`
   - ❌ 잘못된 형식: `postgres.railway.internal`

### 2. 연결 테스트

PowerShell에서:

```powershell
# Public 도메인으로 연결 테스트
Test-NetConnection -ComputerName containers-us-west-xxx.railway.app -Port 5432
```

결과:
- `TcpTestSucceeded: True` → 연결 가능
- `TcpTestSucceeded: False` → 연결 불가 (방화벽 문제)

### 3. pgAdmin4 설정 재확인

1. **Host**: Public 도메인 (정확히 복사)
2. **Port**: `5432`
3. **SSL mode**: `Require` 또는 `Prefer`
4. **Connection timeout**: 더 길게 설정 (예: 30초)

## 해결 방법 3: 방화벽/네트워크 확인

### 회사 네트워크인 경우

- 회사 방화벽이 PostgreSQL 포트(5432)를 차단할 수 있습니다
- 해결: Railway CLI 터널링 사용 (방법 1)

### VPN 사용 중인 경우

- VPN 연결 확인
- VPN을 끄고 다시 시도

### 프록시 설정

- 시스템 프록시 설정 확인
- pgAdmin4 프록시 설정 확인

## 해결 방법 4: pgAdmin4 연결 설정 조정

### Connection 탭

1. **Connection timeout 증가**
   - 기본값보다 더 길게 설정 (예: 30초)

2. **Keep-alive 설정**
   - "Keep-alive" 옵션 활성화

### SSL 탭

1. **SSL mode 변경 시도**
   - `Require` → `Prefer` → `Allow` 순서로 시도
   - 어떤 모드에서도 안 되면 Railway CLI 터널링 사용

## 권장 해결 순서

1. **Railway CLI 터널링 시도** (가장 확실함) ⭐
   ```bash
   railway connect postgres
   ```
   - pgAdmin4에서 `localhost`로 연결

2. **Public Networking 재확인**
   - Settings에서 Public 도메인 확인
   - pgAdmin4에서 Public 도메인 사용

3. **네트워크 환경 확인**
   - 방화벽, VPN, 프록시 확인

4. **pgAdmin4 설정 조정**
   - Connection timeout 증가
   - SSL mode 변경

## Railway CLI 터널링 상세 가이드

### 터널링 시작

```bash
# 1. Railway CLI 설치 (한 번만)
npm i -g @railway/cli

# 2. 로그인
railway login

# 3. 프로젝트 연결
railway link
# 프로젝트 선택

# 4. PostgreSQL 터널링
railway connect postgres
```

### 터널링 중 pgAdmin4 설정

```
Host: localhost
Port: 5432
Database: railway
Username: postgres
Password: (Railway의 PGPASSWORD)
SSL mode: Prefer 또는 Allow
```

### 터널링 중지

- 터미널에서 `Ctrl+C` 누르기
- 또는 터미널 창 닫기

## 빠른 체크리스트

- [ ] Railway CLI 설치 및 로그인 완료
- [ ] `railway link`로 프로젝트 연결
- [ ] `railway connect postgres` 실행
- [ ] 터미널이 열려있는 상태 유지
- [ ] pgAdmin4에서 `localhost`로 연결
- [ ] 연결 성공 확인

## 여전히 안 되면

1. **Railway 지원팀에 문의**
   - Public Networking이 제대로 작동하지 않는 경우

2. **다른 클라이언트 시도**
   - DBeaver
   - TablePlus
   - DataGrip
   - 모두 Railway CLI 터널링과 함께 사용 가능

3. **백엔드에서 직접 작업**
   - Railway 백엔드 서비스의 Query Tool 사용
   - 또는 Railway CLI로 직접 SQL 실행

## 완료 확인

연결 성공 시:
- pgAdmin4에서 서버 아이콘이 열린 상태
- 데이터베이스 목록이 보임
- Query Tool 사용 가능



