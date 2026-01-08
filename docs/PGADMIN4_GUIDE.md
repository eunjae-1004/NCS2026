# pgAdmin4에서 Railway PostgreSQL 마이그레이션 실행 가이드

pgAdmin4로 Railway 데이터베이스에 연결했다면, SQL 스크립트를 실행하는 방법입니다.

## 방법 1: Query Tool 사용 (가장 간단) ⭐ 권장

### 1. 데이터베이스 선택
1. pgAdmin4 왼쪽 트리에서 Railway 서버 확장
2. **Databases** → **railway** (또는 연결한 데이터베이스명) 클릭
3. 마우스 우클릭 → **Query Tool** 선택

### 2. SQL 파일 열기
1. Query Tool 창이 열리면
2. 상단 메뉴에서 **File** → **Open File** 클릭
3. `database/create_tables.sql` 파일 선택
4. 또는 `database/migrate_improvements.sql` 파일 선택

### 3. SQL 실행
1. SQL이 Query Tool에 로드되면
2. **F5** 키를 누르거나
3. 상단 툴바의 **Execute (▶)** 버튼 클릭
4. 또는 **Query** → **Execute** 메뉴 선택

### 4. 결과 확인
- 하단 **Messages** 탭에서 실행 결과 확인
- 오류가 있으면 빨간색으로 표시됨
- 성공하면 "Successfully run. Total query runtime: ..." 메시지 표시

## 방법 2: SQL 직접 복사/붙여넣기

### 1. SQL 파일 열기
- 텍스트 에디터에서 `database/create_tables.sql` 파일 열기
- 전체 내용 복사 (Ctrl+A, Ctrl+C)

### 2. Query Tool에 붙여넣기
1. pgAdmin4에서 Query Tool 열기
2. SQL 내용 붙여넣기 (Ctrl+V)

### 3. 실행
- **F5** 키 또는 **Execute** 버튼 클릭

## 방법 3: 여러 파일 순차 실행

마이그레이션을 순서대로 실행해야 하는 경우:

### 실행 순서
1. **기본 구조** (이미 완료했다면 생략):
   - `database/create_tables.sql`
   - 또는 `database/migrate_selection_history_v2.sql`

2. **개선 사항**:
   - `database/migrate_improvements.sql`

### 실행 방법
각 파일을 Query Tool에서 순서대로 열고 실행합니다.

## 주요 마이그레이션 스크립트

### 1. create_tables.sql
- 전체 테이블 구조 생성
- 트리거, 뷰 포함
- 처음 한 번만 실행

### 2. migrate_selection_history_v2.sql
- `selection_history` 테이블에 code 컬럼 추가
- 기존 데이터 마이그레이션

### 3. migrate_improvements.sql
- 참조 무결성 검증 트리거
- 성능 최적화 뷰 생성

## 실행 결과 확인

### 테이블 확인
```sql
-- Query Tool에서 실행
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 뷰 확인
```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;
```

### 트리거 확인
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

### selection_history 구조 확인
```sql
\d selection_history
```

또는 pgAdmin4에서:
1. 왼쪽 트리에서 **railway** → **Schemas** → **public** → **Tables** → **selection_history** 클릭
2. **Columns** 탭에서 컬럼 확인:
   - `industry_code`
   - `department_code`
   - `job_code`

## 문제 해결

### 1. "relation already exists" 오류
테이블이나 뷰가 이미 존재합니다.

**해결 방법**:
- `CREATE TABLE IF NOT EXISTS` 구문이 있으면 무시해도 됨
- 또는 기존 테이블 삭제 후 재실행 (주의: 데이터 손실)

### 2. "permission denied" 오류
권한이 부족합니다.

**해결 방법**:
- Railway 대시보드에서 사용자 권한 확인
- 보통 `postgres` 사용자는 모든 권한이 있어야 함

### 3. "function does not exist" 오류
함수가 생성되지 않았습니다.

**해결 방법**:
- `create_tables.sql`의 트리거 함수 부분이 실행되었는지 확인
- 트리거 함수를 먼저 생성해야 함

### 4. 스크립트가 너무 길어서 실행이 안 될 때
큰 SQL 파일은 여러 부분으로 나눠서 실행:

1. **트리거 함수 부분만** 먼저 실행
2. **테이블 생성 부분** 실행
3. **뷰 생성 부분** 실행

## 유용한 pgAdmin4 기능

### 1. 실행 계획 확인
- Query Tool에서 SQL 작성 후
- **Explain** 버튼 클릭 (실행 전)
- 또는 **Explain Analyze** 버튼 클릭 (실행 후)

### 2. 결과 내보내기
- Query 실행 후 결과가 나오면
- 우클릭 → **Export/Import** → **Export**
- CSV, JSON 등으로 저장 가능

### 3. 자동 완성
- Query Tool에서 SQL 입력 시
- **Ctrl+Space** 또는 **Alt+Space**로 자동 완성
- 테이블명, 컬럼명 자동 제안

### 4. SQL 포맷팅
- SQL 선택 후
- **Query** → **Format** 메뉴
- 또는 **Shift+Alt+F** (설정에 따라 다름)

## 빠른 체크리스트

마이그레이션 후 확인:

- [ ] `selection_history` 테이블에 `industry_code`, `department_code`, `job_code` 컬럼 존재
- [ ] `selection_history_detail` 뷰 생성됨
- [ ] `ability_unit_usage_stats` 뷰 생성됨
- [ ] `validate_selection_history_codes_trigger` 트리거 생성됨
- [ ] 인덱스 생성됨

## 팁

1. **트랜잭션 사용**: 큰 마이그레이션은 트랜잭션으로 감싸서 실행
   ```sql
   BEGIN;
   -- SQL 실행
   COMMIT;
   -- 또는 롤백: ROLLBACK;
   ```

2. **백업**: 마이그레이션 전에 데이터 백업
   - pgAdmin4에서: 데이터베이스 우클릭 → **Backup**

3. **단계별 실행**: 큰 스크립트는 여러 번에 나눠서 실행

4. **로그 확인**: Query Tool 하단 **Messages** 탭에서 오류 메시지 확인

