# Windows에서 psql 설치 가이드

Railway CLI의 `railway connect postgres` 명령어를 사용하려면 로컬에 PostgreSQL 클라이언트(psql)가 설치되어 있어야 합니다.

## 방법 1: PostgreSQL 전체 설치 (권장)

### 1단계: PostgreSQL 다운로드

1. **PostgreSQL 공식 사이트 접속**
   - https://www.postgresql.org/download/windows/
   - 또는 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **PostgreSQL 설치 프로그램 다운로드**
   - 최신 버전 선택 (예: PostgreSQL 16)
   - Windows x86-64 버전 다운로드

### 2단계: PostgreSQL 설치

1. **설치 프로그램 실행**

2. **설치 옵션 선택**
   - **Installation Directory**: 기본값 사용 (예: `C:\Program Files\PostgreSQL\16`)
   - **Select Components**: 
     - ✅ PostgreSQL Server (선택사항, 필요 없을 수도 있음)
     - ✅ Command Line Tools (필수!) ✅
     - ✅ pgAdmin 4 (선택사항, 이미 사용 중이면 불필요)

3. **데이터 디렉토리**: 기본값 사용

4. **비밀번호 설정** (PostgreSQL 서버를 설치하는 경우)
   - 로컬 PostgreSQL 서버용 비밀번호 (Railway와는 별개)
   - 기억해두세요 (나중에 필요할 수 있음)

5. **포트**: 기본값 `5432` (로컬 서버가 없으면 문제없음)

6. **설치 완료**

### 3단계: 환경 변수 확인

설치 후 자동으로 PATH에 추가되지만, 확인:

1. **PowerShell에서 확인**
   ```powershell
   psql --version
   ```

2. **안 되면 수동으로 PATH 추가**
   - PostgreSQL 설치 경로의 `bin` 폴더를 PATH에 추가
   - 예: `C:\Program Files\PostgreSQL\16\bin`

### 4단계: Railway CLI 터널링 재시도

```bash
railway connect postgres
```

이제 정상적으로 작동해야 합니다!

## 방법 2: PostgreSQL 클라이언트만 설치 (경량)

전체 PostgreSQL 서버가 필요 없고 psql만 필요한 경우:

### 옵션 A: Chocolatey 사용 (권장)

```powershell
# Chocolatey 설치 (아직 안 했다면)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# PostgreSQL 클라이언트만 설치
choco install postgresql --params '/Password:yourpassword' --version=16.0.0
```

### 옵션 B: Scoop 사용

```powershell
# Scoop 설치 (아직 안 했다면)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# PostgreSQL 클라이언트 설치
scoop install postgresql
```

## 방법 3: Railway CLI 없이 pgAdmin4 사용 (대안)

psql 설치가 복잡하다면, Railway의 Public Networking을 사용하는 것이 더 간단할 수 있습니다.

### 1단계: Railway에서 Public Networking 활성화

1. **PostgreSQL 서비스 → Settings → Networking**
2. **"Generate Domain" 클릭**
3. **생성된 Public 도메인 확인**
   - 예: `containers-us-west-xxx.railway.app`

### 2단계: pgAdmin4에서 Public 도메인 사용

1. **서버 Properties → Connection 탭**
2. **Host**: Public 도메인 입력
3. **Port**: `5432`
4. **Database**: `railway`
5. **Username**: `postgres`
6. **Password**: Railway의 `PGPASSWORD`
7. **SSL mode**: `Require` 또는 `Prefer`

### 3단계: 연결 테스트

- 타임아웃 오류가 계속되면 네트워크/방화벽 문제일 수 있습니다
- 이 경우 Railway CLI 터널링이 더 확실합니다

## 방법 4: Docker 사용 (고급)

Docker가 설치되어 있다면:

```bash
# PostgreSQL 클라이언트만 포함된 Docker 이미지 사용
docker run -it --rm postgres:16 psql --version
```

하지만 Railway CLI 터널링과 함께 사용하려면 추가 설정이 필요합니다.

## 설치 확인

### PowerShell에서 확인

```powershell
# psql 버전 확인
psql --version

# Railway CLI 터널링 테스트
railway connect postgres
```

## 문제 해결

### psql을 찾을 수 없다는 오류

**해결:**
1. **PATH 환경 변수 확인**
   ```powershell
   $env:PATH -split ';' | Select-String postgres
   ```

2. **수동으로 PATH 추가**
   - 시스템 환경 변수에 PostgreSQL bin 경로 추가
   - 예: `C:\Program Files\PostgreSQL\16\bin`

3. **PowerShell 재시작**

### Railway CLI가 여전히 psql을 찾지 못함

**해결:**
1. **전체 경로로 psql 실행 테스트**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
   ```

2. **Railway CLI 재설치**
   ```bash
   npm uninstall -g @railway/cli
   npm install -g @railway/cli
   ```

## 빠른 체크리스트

- [ ] PostgreSQL 설치 완료
- [ ] `psql --version` 명령어 성공
- [ ] PATH 환경 변수에 PostgreSQL bin 경로 포함
- [ ] PowerShell 재시작
- [ ] `railway connect postgres` 명령어 성공

## 권장 방법

**가장 간단한 방법:**
1. PostgreSQL 전체 설치 (방법 1)
   - 설치가 간단하고 확실함
   - pgAdmin4도 함께 설치됨 (선택사항)

**psql만 필요한 경우:**
- Chocolatey 또는 Scoop 사용 (방법 2)

**설치가 복잡한 경우:**
- Railway Public Networking 사용 (방법 3)
- 단, 네트워크 문제가 있을 수 있음

## 다음 단계

psql 설치 완료 후:

```bash
# Railway CLI 터널링
railway connect postgres

# 별도 터미널에서 pgAdmin4 사용
# Host: localhost
# Port: 5432
```



