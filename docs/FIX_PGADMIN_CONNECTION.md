# pgAdmin4 연결 오류 해결: [Errno 11001] getaddrinfo failed

## 오류 원인

`[Errno 11001] getaddrinfo failed` 오류는 DNS 조회 실패를 의미합니다. 호스트 주소를 찾을 수 없다는 뜻입니다.

## 즉시 확인 사항

### 1. Railway에서 정확한 호스트 주소 확인

1. **Railway 대시보드 → PostgreSQL 서비스 → Variables 탭**
2. **`PGHOST` 값 확인:**
   - 전체 도메인 이름이어야 함
   - 예: `containers-us-west-123.railway.app`
   - 예: `xxx.up.railway.app`

3. **❌ 잘못된 값들:**
   - `localhost`
   - `127.0.0.1`
   - `railway.app` (서브도메인 없음)
   - IP 주소만

### 2. pgAdmin4 Connection 설정 재확인

1. **서버 우클릭 → Properties**
2. **Connection 탭 확인:**
   - **Host name/address**: Railway의 `PGHOST` 값을 **정확히** 복사
   - 앞뒤 공백 없음
   - 특수 문자 없음
   - 전체 도메인 이름

3. **다시 저장 후 연결 시도**

## 단계별 해결 방법

### 방법 1: Railway Public Networking 확인

1. **PostgreSQL 서비스 → Settings 탭**
2. **"Public Networking" 섹션 확인**
3. **활성화되어 있지 않으면:**
   - "Generate Domain" 클릭
   - 또는 "Public Networking" 토글 활성화

4. **새로 생성된 도메인을 `PGHOST`로 사용**

### 방법 2: DATABASE_URL 파싱

Railway에서 `DATABASE_URL`을 제공하는 경우:

**DATABASE_URL 형식:**
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

**pgAdmin4 설정:**
- **Host**: `containers-us-west-123.railway.app` (postgresql:// 다음, @ 앞)
- **Port**: `5432` (콜론 다음)
- **Database**: `railway` (마지막 / 다음)
- **Username**: `postgres` (@ 앞, 콜론 앞)
- **Password**: `password` (@ 앞, 콜론 뒤)

### 방법 3: 연결 테스트

**PowerShell에서 호스트 연결 테스트:**
```powershell
# Railway 호스트로 연결 테스트
Test-NetConnection -ComputerName containers-us-west-xxx.railway.app -Port 5432
```

**결과 확인:**
- `TcpTestSucceeded: True` → 연결 가능
- `TcpTestSucceeded: False` → 연결 불가 (방화벽 또는 네트워크 문제)

**Ping 테스트:**
```powershell
ping containers-us-west-xxx.railway.app
```

### 방법 4: 서버 재등록

1. **기존 서버 삭제**
   - pgAdmin4에서 서버 우클릭 → "Delete/Drop"

2. **새로 등록**
   - Railway Variables에서 최신 정보 확인
   - 위의 "2단계: pgAdmin4에서 서버 등록" 참고

## 일반적인 실수

### ❌ 잘못된 설정

1. **Host에 localhost 사용**
   ```
   Host: localhost  ❌
   ```

2. **호스트 주소에 프로토콜 포함**
   ```
   Host: postgresql://containers-us-west-xxx.railway.app  ❌
   ```

3. **포트를 호스트에 포함**
   ```
   Host: containers-us-west-xxx.railway.app:5432  ❌
   ```

4. **공백 포함**
   ```
   Host: " containers-us-west-xxx.railway.app "  ❌
   ```

### ✅ 올바른 설정

```
Host: containers-us-west-xxx.railway.app
Port: 5432
Database: railway
Username: postgres
Password: (Railway에서 제공한 비밀번호)
SSL mode: Require
```

## Railway 연결 정보 확인 방법

### 방법 A: Variables 탭

1. PostgreSQL 서비스 → Variables
2. 다음 변수 확인:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### 방법 B: DATABASE_URL 사용

1. PostgreSQL 서비스 → Variables
2. `DATABASE_URL` 확인
3. 위의 "DATABASE_URL 파싱" 방법 사용

### 방법 C: Connect 탭

1. PostgreSQL 서비스 → "Connect" 탭
2. 제공되는 연결 정보 확인
3. "psql" 또는 "Connection String" 확인

## 추가 확인 사항

### 1. Railway 서비스 상태

- PostgreSQL 서비스가 실행 중인지 확인
- 서비스가 중지되어 있으면 시작

### 2. 네트워크 환경

- 회사 네트워크: 방화벽이 5432 포트를 차단할 수 있음
- VPN: VPN 연결 확인
- 프록시: 프록시 설정 확인

### 3. pgAdmin4 버전

- 최신 버전 사용 권장
- 오래된 버전은 SSL 연결 문제가 있을 수 있음

## 빠른 체크리스트

- [ ] Railway Variables에서 `PGHOST` 확인
- [ ] `PGHOST`가 전체 도메인 이름인지 확인 (localhost 아님)
- [ ] pgAdmin4 Host에 정확한 값 입력 (공백 없음)
- [ ] Public Networking 활성화 확인
- [ ] PowerShell에서 연결 테스트 성공
- [ ] SSL mode 설정 확인
- [ ] 서버 재등록 시도

## 여전히 안 되면

1. **Railway 지원팀에 문의**
   - PostgreSQL 서비스가 외부 접속을 허용하는지 확인

2. **대안: Railway CLI 사용**
   ```bash
   railway connect postgres
   ```
   - CLI로 접속하여 작업

3. **대안: 다른 PostgreSQL 클라이언트 사용**
   - DBeaver
   - TablePlus
   - DataGrip

## 성공 확인

연결 성공 시:
- pgAdmin4에서 서버 아이콘이 열린 상태로 변경
- 데이터베이스 목록이 보임
- Query Tool 사용 가능



