# Bash란 무엇인가?

## Bash 기본 설명

**Bash**는 **"Bourne Again Shell"**의 약자로, **명령줄 인터페이스(CLI)**입니다.

### 간단히 말하면:
- **터미널/명령 프롬프트**에서 사용하는 **명령어 언어**
- Linux, macOS에서 기본으로 사용
- Windows에서는 PowerShell이나 CMD를 주로 사용

### Bash vs Windows 명령어

| 작업 | Bash (Linux/macOS) | Windows PowerShell/CMD |
|------|-------------------|------------------------|
| 현재 디렉토리 확인 | `pwd` | `pwd` (PowerShell) / `cd` (CMD) |
| 파일 목록 보기 | `ls` | `ls` (PowerShell) / `dir` (CMD) |
| 디렉토리 이동 | `cd 폴더명` | `cd 폴더명` |
| 파일 실행 | `./파일명` | `.\파일명` (PowerShell) / `파일명.exe` (CMD) |

### Windows에서 Bash 사용하기

Windows에서도 Bash를 사용할 수 있습니다:

1. **Git Bash** (가장 일반적)
   - Git 설치 시 함께 설치됨
   - Windows에서 Linux 명령어 사용 가능

2. **WSL (Windows Subsystem for Linux)**
   - Windows 10/11에서 Linux 환경 실행
   - 완전한 Linux 배포판 사용 가능

3. **PowerShell** (Windows 기본)
   - Windows의 기본 명령줄 도구
   - 대부분의 명령어가 Bash와 유사하게 작동

---

## Railway CLI 사용 시 주의사항

Railway CLI는 **모든 운영체제에서 동일하게 작동**합니다:
- Windows PowerShell에서도 동일한 명령어 사용
- Git Bash에서도 동일한 명령어 사용
- CMD에서도 대부분 동일하게 작동

**중요**: Railway CLI 명령어는 운영체제와 관계없이 동일합니다!

---

## Windows에서 Railway PostgreSQL 접속하기

### 방법 1: PowerShell 사용 (가장 간단) ⭐

Windows PowerShell을 사용하면 됩니다:

1. **PowerShell 열기**
   - `Win + X` → "Windows PowerShell" 또는 "터미널"
   - 또는 시작 메뉴에서 "PowerShell" 검색

2. **Railway CLI 명령어 실행**
   ```powershell
   # Railway CLI 설치 확인
   railway --version

   # 로그인
   railway login

   # 프로젝트 연결
   railway link

   # PostgreSQL 터널링
   railway connect postgres
   ```

3. **터미널 창 열어두기**
   - 이 창을 닫으면 터널이 끊어집니다

4. **pgAdmin4에서 연결**
   - Host: `localhost`
   - Port: `5432`
   - Database: `railway`
   - Username: `postgres`
   - Password: Railway의 `PGPASSWORD`

### 방법 2: Git Bash 사용

Git Bash가 설치되어 있다면:

1. **Git Bash 열기**
   - 시작 메뉴에서 "Git Bash" 검색

2. **동일한 명령어 실행**
   ```bash
   railway login
   railway link
   railway connect postgres
   ```

### 방법 3: CMD 사용

Windows 명령 프롬프트에서도 가능:

1. **CMD 열기**
   - `Win + R` → `cmd` 입력

2. **동일한 명령어 실행**
   ```cmd
   railway login
   railway link
   railway connect postgres
   ```

---

## pgAdmin4 접속이 안 될 때 해결 방법

### 문제 1: Railway CLI 터널링이 안 될 때

**확인 사항:**
1. Railway CLI가 설치되어 있는지 확인
   ```powershell
   railway --version
   ```

2. 로그인되어 있는지 확인
   ```powershell
   railway whoami
   ```

3. 프로젝트가 연결되어 있는지 확인
   ```powershell
   railway status
   ```

**해결 방법:**
```powershell
# Railway CLI 재설치
npm uninstall -g @railway/cli
npm i -g @railway/cli

# 다시 로그인
railway login

# 프로젝트 연결
railway link

# PostgreSQL 터널링
railway connect postgres
```

### 문제 2: pgAdmin4에서 연결 실패

**확인 사항:**
1. **터널링이 실행 중인지 확인**
   - PowerShell에서 `railway connect postgres`가 실행 중이어야 함
   - 터미널 창을 닫으면 안 됩니다!

2. **pgAdmin4 연결 설정 확인**
   - Host: `localhost` (정확히!)
   - Port: `5432`
   - Database: `railway`
   - Username: `postgres`
   - Password: Railway Variables 탭의 `PGPASSWORD` 값

3. **SSL 설정 확인**
   - SSL mode: `Prefer` 또는 `Allow`

### 문제 3: "psql must be installed" 오류

이 오류는 `railway connect postgres` 실행 시 발생할 수 있습니다.

**해결 방법:**
- PostgreSQL 클라이언트 도구 설치 필요
- 또는 pgAdmin4만 사용 (터널링 없이 직접 연결 시도)

---

## 대안: Railway 대시보드에서 직접 작업

pgAdmin4 접속이 계속 안 되면:

### 방법 1: Railway Data 탭 사용

1. **Railway 대시보드 → PostgreSQL 서비스**
2. **"Data" 탭 클릭**
3. **SQL 쿼리 실행**
   - 직접 SQL을 입력하고 실행 가능
   - 제한적이지만 기본 작업은 가능

### 방법 2: Railway CLI로 직접 SQL 실행

터미널에서 직접 SQL 파일 실행:

```powershell
# SQL 파일 실행
railway run psql -f database/cleanup.sql

# 또는 직접 SQL 실행
railway run psql -c "VACUUM FULL;"
```

---

## 단계별 접속 가이드 (Windows)

### 1단계: PowerShell 열기
- `Win + X` → "Windows PowerShell" 또는 "터미널"

### 2단계: Railway CLI 확인
```powershell
railway --version
```

설치되어 있지 않으면:
```powershell
npm i -g @railway/cli
```

### 3단계: 로그인
```powershell
railway login
```
브라우저가 열리면 Railway 계정으로 로그인

### 4단계: 프로젝트 연결
```powershell
railway link
```
프로젝트 목록에서 선택

### 5단계: PostgreSQL 터널링
```powershell
railway connect postgres
```
**이 터미널 창을 열어두세요!**

### 6단계: pgAdmin4 연결
- Host: `localhost`
- Port: `5432`
- Database: `railway`
- Username: `postgres`
- Password: Railway Variables의 `PGPASSWORD`

---

## 요약

- **Bash**: Linux/macOS의 명령줄 언어 (Windows에서는 PowerShell 사용)
- **Railway CLI**: 모든 운영체제에서 동일한 명령어 사용
- **Windows에서 접속**: PowerShell에서 `railway connect postgres` 실행
- **pgAdmin4 연결**: 터널링 실행 후 `localhost:5432`로 연결

