# Railway 대시보드에서 SQL 작성 페이지 접근하기

Railway 대시보드에서 PostgreSQL의 SQL 작성 페이지(Data 탭)에 접근하는 방법입니다.

## 단계별 접근 방법

### 1단계: Railway 대시보드 접속

1. **https://railway.app 접속**
2. **GitHub 계정으로 로그인** (또는 사용 중인 계정)

### 2단계: 프로젝트 선택

1. **대시보드에서 프로젝트 선택**
   - 프로젝트 목록에서 해당 프로젝트 클릭
   - 또는 왼쪽 사이드바에서 프로젝트 선택

### 3단계: PostgreSQL 서비스 찾기

1. **프로젝트 페이지에서 서비스 목록 확인**
   - PostgreSQL 서비스가 보여야 합니다
   - 서비스 이름은 보통 "Postgres" 또는 "PostgreSQL"입니다

2. **PostgreSQL 서비스 클릭**
   - 서비스 카드 또는 목록에서 PostgreSQL 서비스 클릭

### 4단계: Data 탭 찾기

PostgreSQL 서비스 페이지에서 상단에 여러 탭이 있습니다:

- **Deployments** - 배포 이력
- **Metrics** - 메트릭 (CPU, 메모리, 디스크 사용량)
- **Variables** - 환경 변수
- **Settings** - 설정
- **Data** ⭐ - SQL 작성 페이지 (여기입니다!)

**"Data" 탭을 클릭하세요!**

### 5단계: SQL 작성 및 실행

1. **SQL 입력창 확인**
   - Data 탭을 클릭하면 SQL 쿼리를 입력할 수 있는 텍스트 영역이 보입니다

2. **SQL 작성**
   - 텍스트 영역에 SQL을 입력하거나 붙여넣기

3. **실행**
   - "Run" 버튼 또는 "Execute" 버튼 클릭
   - 또는 `Ctrl + Enter` (일부 버전)

4. **결과 확인**
   - 하단에 쿼리 결과가 표시됩니다

---

## Data 탭이 보이지 않을 때

### 문제 1: PostgreSQL 서비스가 보이지 않음

**해결 방법:**
1. 프로젝트에 PostgreSQL 서비스가 있는지 확인
2. 없으면 "New" 버튼 → "Database" → "PostgreSQL" 추가

### 문제 2: Data 탭이 없음

**가능한 원인:**
- Railway 플랜 제한
- 서비스 상태 문제

**해결 방법:**
1. **서비스 재시작**
   - Settings 탭 → "Restart" 버튼

2. **Railway CLI 사용**
   ```powershell
   railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
   ```

3. **Railway 지원팀 문의**
   - Data 탭이 계속 보이지 않으면 Railway 지원팀에 문의

### 문제 3: "Database connection" 오류

**해결 방법:**
1. **서비스 상태 확인**
   - Metrics 탭에서 서비스가 실행 중인지 확인
   - 디스크 공간 부족 오류가 있는지 확인

2. **서비스 재시작**
   - Settings 탭 → "Restart" 버튼 클릭

3. **Variables 확인**
   - Variables 탭에서 데이터베이스 연결 정보 확인
   - `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` 확인

---

## 대안: Railway CLI 사용

Data 탭이 작동하지 않을 때:

### PowerShell에서 Railway CLI 사용

```powershell
# 프로젝트 디렉토리로 이동
cd D:\Website\cursor\ncssearch2026

# Railway CLI 확인
railway --version

# 로그인
railway login

# 프로젝트 연결
railway link

# SQL 실행
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
```

### SQL 파일 실행

```powershell
railway run psql -f database/cleanup_disk_space.sql
```

---

## 스크린샷 가이드 (텍스트 설명)

### Railway 대시보드 구조

```
Railway 대시보드
├── 프로젝트 목록
│   └── [프로젝트 선택]
│       ├── 서비스 목록
│       │   ├── Backend Service
│       │   └── PostgreSQL ⭐ (여기 클릭!)
│       │       ├── Deployments 탭
│       │       ├── Metrics 탭
│       │       ├── Variables 탭
│       │       ├── Settings 탭
│       │       └── Data 탭 ⭐ (SQL 작성 페이지)
│       │           ├── SQL 입력창
│       │           ├── Run 버튼
│       │           └── 결과 표시 영역
```

---

## 빠른 시작: SQL 실행

1. **Railway 대시보드 → 프로젝트 → PostgreSQL 서비스 → Data 탭**

2. **아래 SQL 복사하여 붙여넣기:**

```sql
-- 현재 디스크 사용량 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;
```

3. **"Run" 버튼 클릭**

4. **데이터 정리 SQL 실행:**

```sql
-- 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 디스크 공간 회수
CHECKPOINT;
VACUUM;
```

---

## 문제 해결 체크리스트

- [ ] Railway 대시보드에 로그인되어 있는가?
- [ ] 프로젝트가 선택되어 있는가?
- [ ] PostgreSQL 서비스가 보이는가?
- [ ] PostgreSQL 서비스를 클릭했는가?
- [ ] Data 탭이 보이는가?
- [ ] 서비스가 실행 중인가? (Metrics 탭 확인)
- [ ] 디스크 공간이 부족한가? (Metrics 탭 확인)

---

## 여전히 안 되면

### 방법 1: Railway CLI 사용

```powershell
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
```

### 방법 2: Railway 지원팀 문의

- Railway 대시보드 → Help → Support
- 또는 https://railway.app/help

### 방법 3: 서비스 재생성

1. 새 PostgreSQL 서비스 생성
2. 기존 데이터 마이그레이션 (필요한 경우)

---

## 참고: Railway UI 변경 사항

Railway는 UI를 업데이트할 수 있습니다. 만약 위의 설명과 다르다면:

1. **서비스 페이지에서 모든 탭 확인**
   - Data, Query, SQL, Database 등 다양한 이름일 수 있습니다

2. **Railway 문서 확인**
   - https://docs.railway.app

3. **Railway CLI 사용**
   - UI가 변경되어도 CLI는 안정적입니다

