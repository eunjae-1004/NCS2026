# Railway CLI psql 오류 해결 방법

## 문제: railway run psql에서도 "psql을 찾을 수 없습니다" 오류

이 경우 Railway CLI가 로컬에서 psql을 찾으려고 할 수 있습니다.

## 해결 방법 1: Railway CLI connect 사용

### PostgreSQL에 직접 연결

```powershell
# PostgreSQL에 터널링 연결
railway connect postgres
```

이 명령어는:
- Railway 서버와 터널을 만듭니다
- 로컬에서 psql이 필요할 수 있습니다
- 하지만 Railway CLI가 자동으로 처리할 수도 있습니다

## 해결 방법 2: Railway 대시보드에서 직접 실행 (가장 확실) ⭐⭐⭐

### 단계별 가이드

1. **Railway 대시보드 접속**
   - https://railway.app
   - 프로젝트 선택

2. **PostgreSQL 서비스 찾기**
   - 프로젝트 페이지에서 "Postgres" 또는 "PostgreSQL" 서비스 클릭

3. **Query 탭 또는 Data 탭 찾기**
   - 상단 탭에서 "Query", "Data", "SQL", "Database" 등 찾기
   - Railway 버전에 따라 이름이 다를 수 있습니다

4. **SQL 실행**
   - SQL 입력창에 아래 SQL 붙여넣기:

```sql
-- 현재 디스크 사용량 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 테이블별 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

5. **데이터 정리 실행**

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

## 해결 방법 3: Railway CLI 환경 변수 사용

Railway CLI로 환경 변수를 가져와서 직접 연결:

```powershell
# 환경 변수 가져오기
railway variables

# DATABASE_URL 사용 (psql이 설치되어 있다면)
# 하지만 psql이 없으면 이 방법도 안 됩니다
```

## 해결 방법 4: Railway API 사용

Railway API를 통해 직접 SQL을 실행할 수 있지만, 이는 복잡합니다.

## 추천: Railway 대시보드 사용

**가장 확실한 방법은 Railway 대시보드에서 직접 SQL을 실행하는 것입니다.**

### Railway 대시보드에서 찾아야 할 탭들:

1. **PostgreSQL 서비스 페이지**에서:
   - "Query" 탭
   - "Data" 탭
   - "SQL" 탭
   - "Database" 탭
   - "Connect" 탭 → "Query Tool" 또는 "SQL Editor"

2. **서비스가 다르게 보일 수 있습니다:**
   - 일부 버전에서는 "Connect" 버튼을 클릭하면 SQL 에디터가 열립니다
   - 또는 "Data" 탭 내부에 "Query" 또는 "SQL Editor" 버튼이 있을 수 있습니다

## 빠른 해결: 한 줄씩 실행

Railway 대시보드에서 한 번에 하나씩 실행:

### 1단계: 현재 상태 확인

```sql
SELECT pg_size_pretty(pg_database_size('railway'));
```

### 2단계: 테이블 크기 확인

```sql
SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

### 3단계: 데이터 삭제

```sql
DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';
```

```sql
DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';
```

### 4단계: 공간 회수

```sql
CHECKPOINT;
```

```sql
VACUUM;
```

## 여전히 안 되면

1. **Railway 지원팀에 문의**
   - Railway 대시보드 → Help → Support

2. **서비스 재시작**
   - PostgreSQL 서비스 → Settings → Restart

3. **새 PostgreSQL 서비스 생성**
   - 기존 데이터 백업 후 새로 생성

