# Railway PostgreSQL 디스크 공간 부족 해결

## 문제: "No space left on device"

PostgreSQL 로그에서 다음 오류가 발생했습니다:
```
FATAL: could not write to file "pg_wal/xlogtemp.29": No space left on device
```

이것은 Railway PostgreSQL 데이터베이스의 디스크 공간이 부족하다는 의미입니다.

## 즉시 해결 방법

### 1단계: Railway에서 디스크 사용량 확인

1. **Railway 대시보드 → PostgreSQL 서비스**
2. **Metrics 탭 확인**
   - 디스크 사용량 확인
   - 무료 플랜은 보통 1GB 제한

3. **디스크 사용량 확인**
   - 현재 사용량과 제한 확인

### 2단계: 불필요한 데이터 정리

#### 방법 A: pgAdmin4에서 정리

1. **pgAdmin4 연결** (가능한 경우)

2. **큰 테이블 확인**
   ```sql
   -- 테이블 크기 확인
   SELECT 
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **불필요한 데이터 삭제**
   ```sql
   -- 예: 오래된 로그 데이터 삭제
   DELETE FROM selection_history 
   WHERE selected_at < NOW() - INTERVAL '30 days';

   -- 예: 빈 cart_items 삭제
   DELETE FROM cart_items 
   WHERE added_at < NOW() - INTERVAL '90 days';
   ```

4. **VACUUM 실행** (디스크 공간 회수)
   ```sql
   -- 전체 데이터베이스 정리
   VACUUM FULL;

   -- 또는 특정 테이블만
   VACUUM FULL ncs_main;
   VACUUM FULL cart_items;
   ```

#### 방법 B: Railway CLI로 정리

```bash
# Railway CLI로 접속
railway connect postgres

# psql에서 실행
VACUUM FULL;
```

### 3단계: WAL 파일 정리

PostgreSQL의 WAL (Write-Ahead Log) 파일이 공간을 많이 차지할 수 있습니다.

```sql
-- WAL 파일 확인 (psql에서)
SELECT pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0'));

-- Checkpoint 강제 실행 (WAL 파일 정리)
CHECKPOINT;
```

### 4단계: 데이터베이스 재시작

1. **Railway → PostgreSQL 서비스**
2. **"Restart" 버튼 클릭**
3. **서비스가 정상적으로 시작되는지 확인**

## 근본적인 해결 방법

### 1. Railway 플랜 업그레이드

무료 플랜의 제한:
- 스토리지: 1GB
- 데이터베이스 크기 제한

업그레이드 옵션:
- Railway Pro 플랜으로 업그레이드
- 더 많은 스토리지 제공

### 2. 데이터 최적화

#### 불필요한 데이터 정기 삭제

```sql
-- 오래된 선택 이력 삭제 (30일 이상)
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 오래된 장바구니 아이템 삭제 (90일 이상)
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- VACUUM 실행
VACUUM FULL;
```

#### 인덱스 최적화

```sql
-- 사용하지 않는 인덱스 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 불필요한 인덱스 삭제 (주의!)
-- DROP INDEX 인덱스명;
```

### 3. 데이터베이스 백업 및 정리

1. **중요한 데이터 백업**
   - pgAdmin4에서 Export
   - 또는 Railway CLI로 백업

2. **데이터베이스 재생성** (최후의 수단)
   - 새 PostgreSQL 서비스 생성
   - 스키마 재생성
   - 필요한 데이터만 Import

## 예방 방법

### 1. 정기적인 정리 작업

```sql
-- 매주 실행할 정리 스크립트
-- 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- VACUUM 실행
VACUUM;
```

### 2. 모니터링 설정

- Railway Metrics에서 디스크 사용량 모니터링
- 80% 이상 사용 시 알림 설정

### 3. 데이터 보관 정책

- 오래된 데이터는 정기적으로 삭제
- 중요한 데이터는 별도 백업

## 빠른 해결 체크리스트

- [ ] Railway에서 디스크 사용량 확인
- [ ] 큰 테이블 확인
- [ ] 불필요한 데이터 삭제
- [ ] VACUUM FULL 실행
- [ ] CHECKPOINT 실행
- [ ] PostgreSQL 서비스 재시작
- [ ] 연결 테스트

## 임시 해결책

디스크 공간이 즉시 필요하다면:

1. **가장 큰 테이블 확인**
   ```sql
   SELECT 
       tablename,
       pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size('public.'||tablename) DESC
   LIMIT 10;
   ```

2. **임시 데이터 삭제**
   - 테스트 데이터
   - 오래된 로그
   - 불필요한 사용자 데이터

3. **VACUUM 실행**
   ```sql
   VACUUM FULL;
   ```

## 주의사항

- **VACUUM FULL은 시간이 오래 걸릴 수 있습니다**
- **작업 중 데이터베이스가 잠길 수 있습니다**
- **중요한 데이터는 먼저 백업하세요**

## 다음 단계

1. **디스크 공간 확보**
2. **PostgreSQL 서비스 재시작**
3. **연결 테스트**
4. **정기적인 정리 작업 설정**



