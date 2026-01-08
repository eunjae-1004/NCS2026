# 추천 시스템 개선 사항 요약

## 개요

산업분야+부서 기반 맞춤형 추천 시스템을 위해 모든 개선 사항을 순차적으로 적용했습니다.

## 적용된 개선 사항

### 1. ✅ 외래키 제약조건 추가 (데이터 무결성 보장)

**파일**: `database/create_tables.sql`, `database/migrate_improvements.sql`

- `validate_selection_history_codes()` 트리거 함수 생성
- `selection_history` 테이블에 INSERT/UPDATE 시 `standard_codes` 참조 무결성 검증
- 잘못된 code 저장 방지

**효과**:
- 데이터 일관성 보장
- 잘못된 데이터 입력 사전 차단

### 2. ✅ 매핑 로직 중앙화

**파일**: `server/utils/ncsMapper.js` (신규)

**주요 함수**:
- `mapIndustryNameToCode()`: 산업분야 이름 → code 변환
- `mapDepartmentNameToCode()`: 부서 이름 → code 변환
- `mapJobNameToCode()`: 직무 이름 → code 변환
- `getNcsMainCodes()`: unit_code로부터 ncs_main에서 code 추출
- `batchGetNcsMainCodes()`: 일괄 처리 (성능 최적화)

**효과**:
- 코드 중복 제거
- 유지보수성 향상
- 일관된 매핑 로직

### 3. ✅ NULL 값 처리 정책 수립

**파일**: `server/routes/history.js`

**정책**:
- 최소 하나의 code(industry_code 또는 department_code)는 있어야 함
- 모두 없으면 경고 로그만 남기고 저장은 진행 (데이터 누락 방지)
- 명확한 로깅으로 문제 추적 가능

**효과**:
- 데이터 품질 향상
- 문제 발생 시 추적 용이

### 4. ✅ 성능 최적화 (뷰 생성)

**파일**: `database/create_tables.sql`

**생성된 뷰**:

1. **`selection_history_detail`**
   - `selection_history` + `standard_codes` JOIN
   - code와 name을 함께 제공
   - 조회 쿼리 단순화

2. **`ability_unit_usage_stats`**
   - 산업분야+부서별 능력단위 활용 통계
   - `selection_count`, `user_count`, `last_selected_at` 포함
   - 추천 쿼리 성능 향상

**효과**:
- 쿼리 성능 향상
- 코드 가독성 향상
- 유지보수 용이

### 5. ✅ 추천 로직 개선 (맞춤형 추천)

**파일**: `server/routes/recommendations.js`

**개선 사항**:

#### 추천 우선순위
1. **1순위**: 산업분야+부서 조합으로 정확히 일치하는 선택 이력이 많은 능력단위
2. **2순위**: 산업분야 또는 부서 중 하나만 일치하는 선택 이력이 많은 능력단위
3. **3순위**: 필터 조건에 맞지만 선택 이력이 없는 능력단위

#### 맞춤형 추천 이유
- 산업분야+부서 조합: "제조업 산업의 품질관리 부서에서 15회 선택된 인기 능력단위입니다"
- 산업분야만: "제조업 산업에서 10회 선택된 인기 능력단위입니다"
- 부서만: "품질관리 부서에서 8회 선택된 인기 능력단위입니다"
- 선택 이력 없음: "제조업 산업의 품질관리 부서에 적합한 능력단위입니다"

#### 성능 최적화
- `ability_unit_usage_stats` 뷰 활용
- 정확한 매칭 우선 정렬 (`exact_match_score`)
- 활용 빈도수 기반 정렬 (`selection_count`)

**효과**:
- 사용자 입력(산업분야+부서)에 맞는 정확한 추천
- 선택 이력 기반 인기도 반영
- 명확한 추천 이유 제공

## API 변경 사항

### 추천 API (`GET /api/recommendations`)

**요청**:
```
GET /api/recommendations?industry=제조업&department=품질관리
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "abilityUnit": { ... },
      "reason": "제조업 산업의 품질관리 부서에서 15회 선택된 인기 능력단위입니다",
      "reasonType": "customized",
      "selectionCount": 15
    }
  ],
  "meta": {
    "industry": "제조업",
    "department": "품질관리",
    "totalResults": 20
  }
}
```

**변경 사항**:
- `reasonType`: `'customized'` 추가 (산업분야+부서 조합)
- `selectionCount`: 선택 횟수 포함
- `meta`: 요청 정보 포함

### 선택 이력 저장 API (`POST /api/history/selections`)

**개선 사항**:
- 중앙화된 매핑 함수 사용
- NULL 값 처리 정책 적용
- 경고 로그 추가

## 데이터베이스 마이그레이션

### 실행 순서

1. **기본 구조 마이그레이션** (이미 완료):
```bash
psql -U postgres -d railway -f database/migrate_selection_history_v2.sql
```

2. **개선 사항 마이그레이션**:
```bash
psql -U postgres -d railway -f database/migrate_improvements.sql
```

또는 `create_tables.sql`을 재실행하면 모든 개선 사항이 포함됩니다.

## 테스트 체크리스트

### 1. 데이터 무결성 검증
- [ ] 잘못된 code로 선택 이력 저장 시도 → 에러 발생 확인
- [ ] 올바른 code로 선택 이력 저장 → 정상 저장 확인

### 2. 매핑 로직
- [ ] 다양한 입력값(별칭 포함) → 올바른 code 변환 확인
- [ ] ncs_main에서 자동 매핑 → code 추출 확인

### 3. 추천 로직
- [ ] 산업분야+부서 입력 → 정확한 매칭 우선 추천 확인
- [ ] 선택 이력 많은 능력단위 → 상위 노출 확인
- [ ] 추천 이유 명확성 확인

### 4. 성능
- [ ] 뷰를 통한 조회 성능 확인
- [ ] 대량 데이터에서도 빠른 응답 확인

## 주의사항

1. **standard_codes 테이블 필수**: 모든 code는 `standard_codes`에 존재해야 합니다.
2. **트리거 성능**: 트리거는 INSERT/UPDATE 시 실행되므로 약간의 성능 오버헤드가 있습니다.
3. **뷰 업데이트**: 뷰는 실시간으로 계산되므로 데이터 변경 시 자동 반영됩니다.

## 향후 개선 가능 사항

1. **캐싱**: 자주 사용되는 매핑 결과 캐싱
2. **머신러닝**: 사용자 행동 기반 추천 가중치 조정
3. **A/B 테스트**: 추천 알고리즘 효과 측정
4. **실시간 통계**: 선택 이력 실시간 집계 (Materialized View)

## 요약

모든 개선 사항이 순차적으로 적용되어:
- ✅ 데이터 무결성 보장
- ✅ 코드 중복 제거 및 유지보수성 향상
- ✅ 성능 최적화
- ✅ 맞춤형 추천 로직 구현

사용자가 산업분야와 부서 정보를 입력하면, `selection_history`를 분석하여 정확하고 인기 있는 능력단위를 맞춤형으로 제안합니다.

