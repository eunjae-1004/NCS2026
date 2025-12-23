# API 문서

이 문서는 NCS 능력단위 검색 시스템의 API 엔드포인트를 정의합니다.

## 기본 URL
```
http://localhost:3000/api
```

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

### 실패 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 엔드포인트

### 1. 능력단위 검색
**GET** `/ability-units`

**Query Parameters:**
- `industry` (optional): 산업분야
- `department` (optional): 부서
- `jobCategory` (optional): 직무군/직무
- `jobTitle` (optional): 직무명
- `level` (optional): 레벨 (숙련도)
- `keyword` (optional): 키워드

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "summary": "string",
      "definition": "string",
      "industry": "string",
      "department": "string",
      "jobCategory": "string",
      "level": number,
      "elements": [...],
      "performanceCriteria": [...],
      "knowledge": ["string"],
      "skills": ["string"],
      "attitudes": ["string"],
      "keywords": ["string"]
    }
  ]
}
```

### 2. 능력단위 상세 조회
**GET** `/ability-units/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    ...
  }
}
```

### 3. 별칭 매핑
**POST** `/alias/map`

**Request Body:**
```json
{
  "input": "string",
  "type": "department" | "industry" | "job"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "input": "string",
    "standard": "string",
    "confidence": number,
    "candidates": ["string"] // confidence < 0.8인 경우
  }
}
```

### 4. 추천 능력단위 조회
**GET** `/recommendations`

**Query Parameters:**
- `industry` (optional): 산업분야
- `department` (optional): 부서

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "abilityUnit": { ... },
      "reason": "string",
      "reasonType": "mapping" | "popular" | "similar"
    }
  ]
}
```

### 5. 유사 능력단위 조회
**GET** `/ability-units/:id/similar`

**Response:**
```json
{
  "success": true,
  "data": [
    { ... } // AbilityUnit 배열
  ]
}
```

### 6. 선택 이력 저장
**POST** `/history/selections`

**Request Body:**
```json
{
  "userId": "string",
  "abilityUnitId": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### 7. 사용자별 선택 이력 조회
**GET** `/history/selections/:userId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "abilityUnitId": "string",
      "selectedAt": "ISO 8601 date string"
    }
  ]
}
```

### 8. 기관 목록 조회
**GET** `/organizations`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "public" | "enterprise"
    }
  ]
}
```

### 9. 표준 코드 조회
**GET** `/standard-codes/:type`

**Path Parameters:**
- `type`: `departments` | `industries` | `jobs`

**Response:**
```json
{
  "success": true,
  "data": ["string"]
}
```

## 데이터베이스 스키마 (제안)

### 선택 이력 테이블
```sql
CREATE TABLE selection_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  ability_unit_id VARCHAR(255) NOT NULL,
  selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_ability_unit_id (ability_unit_id),
  INDEX idx_selected_at (selected_at)
);
```

### 사용자 테이블
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization_id VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 구현 가이드

1. **백엔드 서버 구축**
   - Node.js/Express, Python/Django, Java/Spring 등 선택
   - 위의 API 엔드포인트 구현

2. **데이터베이스 설정**
   - PostgreSQL, MySQL 등 선택
   - 위의 스키마 기반으로 테이블 생성

3. **환경 변수 설정**
   - `.env` 파일에 `VITE_USE_MOCK_DATA=false` 설정
   - `VITE_API_BASE_URL`을 실제 API 서버 주소로 설정

4. **테스트**
   - 각 API 엔드포인트 테스트
   - 프론트엔드와 연동 테스트

