# job, industry, department 값 설정 흐름

## 개요
이 문서는 `job`, `industry`, `department` 값이 언제, 어디서 설정되는지 설명합니다.

## 값 설정 시점 및 위치

### 1. 백엔드에서 설정 (데이터베이스 → API 응답)

#### 1.1 능력단위 검색 API (`GET /api/ability-units`)
**파일**: `server/routes/abilityUnits.js` (라인 183-223)

```javascript
const abilityUnits = result.rows.map((row) => ({
  // ...
  industry: row.major_category_name || null,      // ← ncs_main.major_category_name에서 가져옴
  department: row.sub_category_name || null,      // ← ncs_main.sub_category_name에서 가져옴
  jobCategory: row.small_category_name || null,   // ← ncs_main.small_category_name에서 가져옴
  // ...
}))
```

**데이터 소스**: 
- `ncs_main` 테이블의 `major_category_name` → `industry`
- `ncs_main` 테이블의 `sub_category_name` → `department`
- `ncs_main` 테이블의 `small_category_name` → `jobCategory`

#### 1.2 능력단위 상세 조회 API (`GET /api/ability-units/:id`)
**파일**: `server/routes/abilityUnits.js` (라인 367-396)

```javascript
const abilityUnit = {
  // ...
  industry: unit.major_category_name || null,     // ← ncs_main.major_category_name에서 가져옴
  department: unit.sub_category_name || null,     // ← ncs_main.sub_category_name에서 가져옴
  jobCategory: unit.small_category_name || null,  // ← ncs_main.small_category_name에서 가져옴
  // ...
}
```

**데이터 소스**: 동일하게 `ncs_main` 테이블에서 가져옴

#### 1.3 추천 API (`GET /api/recommendations`)
**파일**: `server/routes/recommendations.js` (라인 226-250)

```javascript
return {
  abilityUnit: {
    // ...
    industry: row.major_category_name || null,    // ← ncs_main.major_category_name에서 가져옴
    department: row.sub_category_name || null,     // ← ncs_main.sub_category_name에서 가져옴
    jobCategory: row.small_category_name || null,  // ← ncs_main.small_category_name에서 가져옴
    // ...
  },
  // ...
}
```

**데이터 소스**: 동일하게 `ncs_main` 테이블에서 가져옴

### 2. 프론트엔드에서 사용

#### 2.1 AbilityDetailPage (능력단위 상세 페이지)
**파일**: `src/pages/AbilityDetailPage.tsx`

```typescript
// API에서 받은 abilityUnit 객체 사용
saveSelectionHistory(
  user.id, 
  abilityUnit.id,
  abilityUnit.industry,      // ← 백엔드에서 받은 값
  abilityUnit.department     // ← 백엔드에서 받은 값
)
```

**값의 출처**: `getAbilityUnitById(id)` API 호출 결과

#### 2.2 SearchResultsPage (검색 결과 페이지)
**파일**: `src/pages/SearchResultsPage.tsx`

```typescript
// 검색 결과에서 받은 abilityUnit 객체 사용
saveSelectionHistory(
  user.id, 
  abilityUnit.id,
  abilityUnit.industry,      // ← 백엔드에서 받은 값
  abilityUnit.department     // ← 백엔드에서 받은 값
)
```

**값의 출처**: `searchAbilityUnits(filters)` API 호출 결과

#### 2.3 RecommendationPage (추천 페이지)
**파일**: `src/pages/RecommendationPage.tsx`

```typescript
// 우선순위: 1) abilityUnit의 정보, 2) 사용자가 선택한 정보
const industry = recommendation.abilityUnit?.industry || selectedIndustry || undefined
const department = recommendation.abilityUnit?.department || selectedDepartment || undefined

saveSelectionHistory(
  user.id, 
  recommendation.abilityUnit.id,
  industry,    // ← abilityUnit.industry 또는 사용자가 선택한 selectedIndustry
  department   // ← abilityUnit.department 또는 사용자가 선택한 selectedDepartment
)
```

**값의 출처**: 
1. `getRecommendations(industry, department)` API 호출 결과의 `recommendation.abilityUnit.industry/department`
2. 사용자가 선택한 `selectedIndustry`, `selectedDepartment` (드롭다운에서 선택)

## 데이터 흐름도

```
[데이터베이스]
ncs_main 테이블
├── major_category_name  → industry
├── sub_category_name    → department
└── small_category_name  → jobCategory

        ↓ (SQL 쿼리)

[백엔드 API]
server/routes/abilityUnits.js
server/routes/recommendations.js
├── industry: row.major_category_name || null
├── department: row.sub_category_name || null
└── jobCategory: row.small_category_name || null

        ↓ (JSON 응답)

[프론트엔드]
src/pages/*.tsx
├── abilityUnit.industry
├── abilityUnit.department
└── abilityUnit.jobCategory

        ↓ (API 호출)

[백엔드 저장]
server/routes/history.js
├── industry → normalizeAliasesToCodes() → industry_code
├── department → normalizeAliasesToCodes() → department_code
└── job → normalizeAliasesToCodes() → job_code

        ↓ (데이터베이스 저장)

[데이터베이스]
selection_history 테이블
├── industry_code
├── department_code
└── job_code
```

## 문제점 분석

### 현재 문제: NULL 값이 전달되는 이유

1. **데이터베이스에 값이 없는 경우**
   - `ncs_main` 테이블의 `major_category_name`, `sub_category_name`이 NULL이거나 빈 값
   - 백엔드에서 `|| null`로 처리되어 `null`이 반환됨

2. **프론트엔드에서 null 값 전달**
   - `abilityUnit.industry`가 `null`이면 `saveSelectionHistory`에 `null`이 전달됨
   - 백엔드에서 `null`을 받아서 `normalizeAliasesToCodes`에 전달하면 빈 문자열 반환

3. **대체 로직이 작동하지 않는 경우**
   - `getNcsMainCodes(unitCode)`를 호출하여 `ncs_main`에서 다시 가져오지만, 여전히 NULL일 수 있음

## 해결 방법

### 옵션 1: 데이터베이스 데이터 확인 및 업데이트
- `ncs_main` 테이블에 `major_category_name`, `sub_category_name` 값이 실제로 있는지 확인
- 없으면 데이터를 업데이트하거나 import

### 옵션 2: 백엔드에서 기본값 제공
- `major_category_name`, `sub_category_name`이 NULL인 경우 기본값 제공
- 또는 다른 테이블에서 참조하여 가져오기

### 옵션 3: 프론트엔드에서 사용자 입력 요청
- `abilityUnit.industry`, `abilityUnit.department`가 없을 때 사용자에게 입력 요청
- 또는 검색 필터에서 선택한 값을 사용

## 확인 방법

1. **데이터베이스 확인**
   ```sql
   SELECT 
     unit_code,
     major_category_name,
     sub_category_name,
     small_category_name
   FROM ncs_main
   WHERE unit_code = 'YOUR_UNIT_CODE'
   LIMIT 1;
   ```

2. **백엔드 로그 확인**
   - Railway 로그에서 "=== 상세 조회 - 조회된 데이터 ===" 확인
   - `major_category_name_is_null`, `sub_category_name_is_null` 값 확인

3. **프론트엔드 로그 확인**
   - 브라우저 콘솔에서 "선택 이력 저장 시도" 로그 확인
   - `abilityUnit.industry`, `abilityUnit.department` 값 확인

