# 스키마 수정 사항

## 문제점

외래 키 제약 조건 오류가 발생했습니다:
```
ERROR: 참조되는 "ncs_main" 테이블을 위한 주어진 키와 일치하는 고유 제약 조건이 없습니다
```

## 원인

`ncs_main` 테이블에서:
- `unit_code`는 여러 행에 중복될 수 있습니다 (같은 능력단위에 여러 요소가 있음)
- `unit_element_code`도 여러 행에 중복될 수 있습니다
- 따라서 이들 컬럼은 UNIQUE 제약 조건이 없습니다

외래 키(Foreign Key)를 생성하려면 참조되는 컬럼이 UNIQUE 또는 PRIMARY KEY여야 합니다.

## 해결 방법

외래 키 제약 조건을 제거하고, 애플리케이션 레벨에서 데이터 무결성을 관리합니다.

### 수정된 테이블

1. **unit_definition**
   - `FOREIGN KEY (unit_code) REFERENCES ncs_main(unit_code)` 제거
   - `unit_code`는 PRIMARY KEY이므로 자체적으로 UNIQUE

2. **performance_criteria**
   - `FOREIGN KEY (unit_code) REFERENCES ncs_main(unit_code)` 제거
   - `FOREIGN KEY (unit_element_code) REFERENCES ncs_main(unit_element_code)` 제거

3. **selection_history**
   - `FOREIGN KEY (unit_code) REFERENCES ncs_main(unit_code)` 제거

4. **cart_items**
   - `FOREIGN KEY (unit_code) REFERENCES ncs_main(unit_code)` 제거

5. **cart_set_items**
   - `FOREIGN KEY (unit_code) REFERENCES ncs_main(unit_code)` 제거

## 데이터 무결성 보장 방법

### 애플리케이션 레벨에서

1. **데이터 삽입 시 검증**
   - `unit_code`가 `ncs_main`에 존재하는지 확인
   - `unit_element_code`가 `ncs_main`에 존재하는지 확인

2. **API 레벨에서 검증**
   ```javascript
   // 예시: unit_code 존재 확인
   const checkUnitCode = async (unitCode) => {
     const result = await query(
       'SELECT COUNT(*) FROM ncs_main WHERE unit_code = $1',
       [unitCode]
     )
     return result.rows[0].count > 0
   }
   ```

3. **트리거 사용 (선택사항)**
   - 데이터 삽입/수정 시 자동으로 검증하는 트리거 추가 가능

## 스키마 재생성

기존 테이블이 있다면:

```sql
-- 기존 테이블 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS cart_set_items CASCADE;
DROP TABLE IF EXISTS cart_sets CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS selection_history CASCADE;
DROP TABLE IF EXISTS performance_criteria CASCADE;
DROP TABLE IF EXISTS unit_definition CASCADE;
DROP TABLE IF EXISTS ncs_main CASCADE;
-- ... 기타 테이블들

-- 스키마 재생성
\i database/schema.sql
```

또는 수정된 스키마 파일을 다시 실행:

```bash
psql -U postgres -d ncs_search -f database/schema.sql
```

## 참고

- 외래 키 제약 조건이 없어도 데이터베이스는 정상 작동합니다
- 애플리케이션 코드에서 데이터 무결성을 보장해야 합니다
- 인덱스는 그대로 유지되어 검색 성능은 영향 없습니다


