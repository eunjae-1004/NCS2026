# PowerShell에서 Railway PostgreSQL 데이터 정리하기

공간 부족 문제를 해결하기 위해 PowerShell에서 직접 데이터를 정리하는 방법입니다.

## ⚠️ 중요: psql이 설치되어 있지 않아도 됩니다!

`railway run psql` 명령어는 Railway 서버에서 실행되므로, **로컬에 psql이 설치되어 있지 않아도** 작동합니다!

## 방법 1: SQL 파일 실행 (권장) ⭐

### 1단계: PowerShell 열기

1. **`Win + X` 키 누르기**
2. **"Windows PowerShell" 또는 "터미널" 선택**

### 2단계: 프로젝트 디렉토리로 이동

```powershell
cd D:\Website\cursor\ncssearch2026
```

### 3단계: Railway CLI 확인 및 로그인

```powershell
# Railway CLI 설치 확인
railway --version

# 로그인 (필요한 경우)
railway login

# 프로젝트 연결 (필요한 경우)
railway link
```

### 4단계: SQL 파일 실행

#### 일반 정리 (안전한 방법)

```powershell
# ⚠️ 로컬에 psql이 없어도 작동합니다!
railway run psql -f database/cleanup_disk_space.sql
```

이 스크립트는:
- 30일 이상 된 선택 이력 삭제
- 90일 이상 된 장바구니 아이템 삭제
- VACUUM 실행 (디스크 공간 회수)

#### 공격적인 정리 (더 많은 공간 확보)

```powershell
railway run psql -f database/cleanup_aggressive.sql
```

이 스크립트는:
- 7일 이상 된 선택 이력 삭제
- 30일 이상 된 장바구니 아이템 삭제
- Guest 사용자 데이터 삭제
- VACUUM FULL 실행

---

## 방법 2: 직접 SQL 실행

### 1단계: Railway CLI로 접속

```powershell
railway connect postgres
```

이 명령어는 `psql` 세션을 시작합니다.

### 2단계: SQL 직접 실행

psql 프롬프트(`railway=#`)에서:

```sql
-- 1. 현재 디스크 사용량 확인
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 2. 테이블별 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 3. 삭제될 데이터 개수 확인
SELECT COUNT(*) FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

SELECT COUNT(*) FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 4. 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 5. WAL 파일 정리
CHECKPOINT;

-- 6. 디스크 공간 회수
VACUUM;

-- 7. 최종 확인
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_after;
```

### 3단계: 종료

```sql
\q
```

---

## 방법 3: Railway 대시보드에서 실행 (가장 간단!) ⭐⭐⭐

**psql이나 Railway CLI 없이도 가능합니다!**

1. **Railway 대시보드 → PostgreSQL 서비스 → Data 탭**
2. **SQL 입력창에 아래 SQL 복사하여 붙여넣기:**

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

3. **"Run" 버튼 클릭**

**이 방법이 가장 간단하고 별도 도구 설치가 필요 없습니다!**

---

## 빠른 시작: 한 줄 명령어

PowerShell에서 한 줄로 실행:

```powershell
railway run psql -c "DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days'; DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days'; VACUUM;"
```

---

## 단계별 상세 가이드

### 1단계: 현재 상태 확인

먼저 어떤 데이터가 많은지 확인:

```powershell
railway run psql -c "SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size('public.'||tablename) DESC;"
```

### 2단계: 삭제될 데이터 확인

실제로 삭제될 데이터 개수 확인:

```powershell
railway run psql -c "SELECT COUNT(*) AS selection_history_old FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days'; SELECT COUNT(*) AS cart_items_old FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';"
```

### 3단계: 데이터 삭제

확인 후 삭제:

```powershell
railway run psql -c "DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days'; DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';"
```

### 4단계: 디스크 공간 회수

```powershell
railway run psql -c "CHECKPOINT; VACUUM;"
```

### 5단계: 결과 확인

```powershell
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;"
```

---

## 공간 확보 우선순위

### 1순위: 오래된 이력 데이터 삭제
- `selection_history`: 30일 이상
- `cart_items`: 90일 이상

### 2순위: Guest 사용자 데이터 삭제
```sql
DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');
DELETE FROM selection_history WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');
```

### 3순위: WAL 파일 정리
```sql
CHECKPOINT;
```

### 4순위: VACUUM 실행
```sql
VACUUM;
-- 또는 더 강력한 정리
VACUUM FULL;
```

---

## 주의사항

### ⚠️ DELETE는 되돌릴 수 없습니다!

1. **실행 전에 SELECT로 확인하세요:**
   ```sql
   SELECT COUNT(*) FROM selection_history 
   WHERE selected_at < NOW() - INTERVAL '30 days';
   ```

2. **중요한 데이터는 먼저 백업:**
   - Railway Data 탭에서 Export 가능
   - 또는 `pg_dump` 사용

### ⚠️ VACUUM FULL은 시간이 오래 걸립니다

- 데이터베이스가 잠길 수 있습니다
- 작업 중에는 다른 작업을 하지 마세요
- 큰 테이블은 하나씩 실행하는 것을 권장합니다

### ⚠️ 공격적인 정리는 신중하게

`cleanup_aggressive.sql`은 더 많은 데이터를 삭제합니다:
- 7일 이상 된 선택 이력 삭제
- 30일 이상 된 장바구니 아이템 삭제
- Guest 사용자 데이터 모두 삭제

---

## 문제 해결

### "railway: command not found"

Railway CLI가 설치되어 있지 않습니다:

```powershell
npm i -g @railway/cli
```

### "not logged in"

Railway에 로그인하세요:

```powershell
railway login
```

### "no project linked"

프로젝트를 연결하세요:

```powershell
railway link
```

### "psql: command not found"

**해결 방법**: `railway run psql`을 사용하세요! 로컬에 psql이 없어도 Railway 서버에서 실행됩니다.

또는 Railway 대시보드의 Data 탭을 사용하세요 (가장 간단).

---

## 추천 워크플로우

1. **현재 상태 확인**
   ```powershell
   railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
   ```

2. **일반 정리 실행**
   ```powershell
   railway run psql -f database/cleanup_disk_space.sql
   ```

3. **결과 확인**
   ```powershell
   railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
   ```

4. **여전히 공간이 부족하면 공격적인 정리**
   ```powershell
   railway run psql -f database/cleanup_aggressive.sql
   ```

---

## 완료 확인

정리 후 Railway 대시보드에서:
1. **PostgreSQL 서비스 → Metrics 탭**
2. **디스크 사용량 확인**
3. **공간이 확보되었는지 확인**

