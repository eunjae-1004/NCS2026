# Railway 디스크 공간 정리 가이드

## ⚠️ 중요: Wipe Volume 사용 금지!

**절대 하지 마세요:**
- ❌ Wipe Volume 클릭
- ❌ Delete Volume 클릭

이것들은 **모든 데이터를 영구적으로 삭제**합니다!

## 안전한 정리 방법

### 방법 1: Railway CLI 사용 (권장)

#### 1단계: Railway CLI 설치 및 로그인

```powershell
# Railway CLI 설치 (아직 안 했다면)
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link
```

#### 2단계: 삭제될 데이터 확인 (먼저 확인!)

```powershell
# 삭제될 데이터 개수 확인
railway run psql -c "
SELECT 
    (SELECT COUNT(*) FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days') AS old_selection_history,
    (SELECT COUNT(*) FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days') AS old_cart_items,
    (SELECT COUNT(*) FROM users WHERE role = 'guest') AS guest_users;
"
```

#### 3단계: 안전한 정리 스크립트 실행

```powershell
# 정리 스크립트 실행
railway run psql -f database/cleanup_railway_safe.sql
```

또는 단계별로 실행:

```powershell
# 1. 오래된 선택 이력 삭제 (30일 이상)
railway run psql -c "DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';"

# 2. 오래된 장바구니 아이템 삭제 (90일 이상)
railway run psql -c "DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';"

# 3. Guest 사용자 데이터 삭제
railway run psql -c "DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');"
railway run psql -c "DELETE FROM selection_history WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');"

# 4. 디스크 공간 회수
railway run psql -c "CHECKPOINT; VACUUM ANALYZE;"
```

#### 4단계: 정리 결과 확인

```powershell
# 정리 후 데이터베이스 크기 확인
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;"
```

### 방법 2: Railway 대시보드 Data 탭 사용

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 → PostgreSQL 서비스

2. **Data 탭 클릭**

3. **Query 실행**
   - 아래 SQL을 복사하여 실행

```sql
-- 삭제될 데이터 확인
SELECT 
    (SELECT COUNT(*) FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days') AS old_selection_history,
    (SELECT COUNT(*) FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days') AS old_cart_items;

-- 데이터 삭제
DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';
DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';

-- Guest 사용자 데이터 삭제
DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');
DELETE FROM selection_history WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 디스크 공간 회수
CHECKPOINT;
VACUUM ANALYZE;
```

## 정리 항목

### 1. 오래된 선택 이력 (30일 이상)
- `selection_history` 테이블
- 30일 이상 된 선택 이력 삭제

### 2. 오래된 장바구니 아이템 (90일 이상)
- `cart_items` 테이블
- 90일 이상 된 장바구니 아이템 삭제

### 3. Guest 사용자 데이터
- 테스트용 Guest 사용자의 모든 데이터 삭제
- `cart_items`, `selection_history`, `cart_sets`

### 4. 빈 장바구니 세트
- 아이템이 없는 오래된 장바구니 세트 삭제

## 주의사항

### ⚠️ DELETE는 되돌릴 수 없습니다!

1. **실행 전에 SELECT로 확인하세요**
   ```sql
   SELECT COUNT(*) FROM selection_history 
   WHERE selected_at < NOW() - INTERVAL '30 days';
   ```

2. **중요한 데이터는 먼저 백업**
   - Railway Data 탭에서 Export 가능
   - 또는 `pg_dump` 사용

3. **VACUUM은 시간이 걸릴 수 있습니다**
   - 데이터베이스가 잠길 수 있습니다
   - 작업 중에는 다른 작업을 하지 마세요

## 예상 결과

정리 전:
```
database_size: 850 MB
```

정리 후:
```
database_size: 200 MB (예상)
```

## 문제 해결

### 문제: "No space left on device" 에러
**해결:**
1. 위의 정리 스크립트 실행
2. VACUUM FULL 실행 (시간 오래 걸림)
3. Railway 플랜 업그레이드 고려

### 문제: VACUUM이 너무 오래 걸림
**해결:**
1. VACUUM ANALYZE 사용 (VACUUM FULL보다 빠름)
2. 큰 테이블은 개별적으로 VACUUM
3. 작업은 밤에 실행 권장

## 정기적인 정리

매주 또는 매월 실행 권장:

```powershell
# 주간 정리 스크립트
railway run psql -c "
DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';
DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';
CHECKPOINT;
VACUUM;
"
```

