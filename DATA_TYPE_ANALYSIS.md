# 데이터 타입 구조 분석

## 현재 데이터 타입 구조

### 1. 프론트엔드 (TypeScript)

#### AbilityUnit 타입 정의:
```typescript
interface AbilityUnit {
  id: string        // 타입 정의: string
  code: string      // 타입 정의: string
  // ...
}
```

#### 실제 전달되는 데이터:
```javascript
// src/store/useStore.ts:130
const unitCode = abilityUnit.code || abilityUnit.id
// unitCode는 string이어야 하지만, 실제로는 number일 수 있음
```

#### API 호출:
```typescript
// src/services/api.ts:235-238
addCartItem(userId: string, unitCode: string, memo?: string)
// unitCode는 string으로 타입 정의되어 있음
```

### 2. 백엔드 (Node.js)

#### 받는 데이터:
```javascript
// server/routes/cart.js:149
const { userId, unitCode, memo } = req.body
// unitCode는 JSON에서 파싱된 값 (number 또는 string)
```

#### DB 쿼리:
```javascript
// String(unitCode)로 변환 시도
const unitCodeStr = String(unitCode)
await query(insertQuery, [userId, unitCodeStr, memo || null])
```

### 3. 데이터베이스 (PostgreSQL)

#### 테이블 스키마:
```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30) NOT NULL,  -- VARCHAR 타입
    memo TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, unit_code)
);
```

## 문제 분석

### 타입 불일치 가능성:

1. **프론트엔드에서 전달되는 값**:
   - `abilityUnit.id`가 실제로는 숫자일 수 있음 (타입 정의는 string이지만)
   - `abilityUnit.code`가 없으면 `abilityUnit.id`를 사용
   - 숫자가 JSON으로 직렬화되어 전달됨

2. **백엔드에서 받는 값**:
   - JSON 파싱 시 숫자는 `number` 타입으로 파싱됨
   - `String(unitCode)`로 변환하지만, PostgreSQL이 타입을 추론할 때 문제 발생 가능

3. **PostgreSQL 타입 추론**:
   - `$1`에 숫자가 전달되면 PostgreSQL이 INTEGER로 추론
   - 하지만 `unit_code`는 VARCHAR이므로 타입 불일치 발생

## 해결 방법

### 방법 1: 백엔드에서 명시적 타입 캐스팅 (현재 적용됨)
```javascript
const unitCodeStr = String(unitCode)
```

### 방법 2: SQL에서 명시적 타입 캐스팅
```sql
VALUES ($1, $2::VARCHAR, $3, CURRENT_TIMESTAMP)
```

### 방법 3: 프론트엔드에서 문자열로 변환
```javascript
const unitCode = String(abilityUnit.code || abilityUnit.id)
```

