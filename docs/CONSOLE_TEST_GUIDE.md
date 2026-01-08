# 브라우저 Console에서 API 테스트하는 방법

## 단계별 가이드

### Step 1: 브라우저 열기

1. **아무 브라우저나 열기** (Chrome, Edge, Firefox 등)
2. **아무 웹페이지나 열기** (예: google.com)

### Step 2: 개발자 도구 열기

**방법 A: 키보드 단축키 (가장 빠름)**
- **F12 키** 누르기
- 또는 **Ctrl + Shift + I** (Windows)
- 또는 **Cmd + Option + I** (Mac)

**방법 B: 마우스로**
- 브라우저 화면에서 **우클릭** (마우스 오른쪽 버튼)
- 메뉴에서 **"검사"** 또는 **"Inspect"** 클릭

### Step 3: Console 탭 찾기

개발자 도구가 열리면:
- 화면 하단 또는 오른쪽에 창이 나타납니다
- 상단에 여러 탭이 있습니다:
  - **Elements** (요소)
  - **Console** ← **여기 클릭!**
  - **Sources** (소스)
  - **Network** (네트워크)
  - 등등...

**Console 탭을 클릭합니다.**

### Step 4: Console 화면 확인

Console 탭을 클릭하면:
- 화면이 두 부분으로 나뉩니다:
  - **위쪽**: 콘솔 로그가 표시되는 영역
  - **아래쪽**: 코드를 입력하는 영역 (커서가 깜빡이는 곳)
    - 보통 `>` 기호가 보입니다
    - 또는 "Console"이라고 적혀있습니다

### Step 5: 코드 입력하기

**아래쪽 입력 영역을 클릭**하여 커서를 놓습니다.

그 다음 다음 코드를 **복사해서 붙여넣기**하거나 **직접 입력**합니다:

```javascript
fetch('https://ncssearch-backend-production.up.railway.app/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Step 6: Enter 키 누르기

코드를 입력한 후 **Enter 키**를 누릅니다.

### Step 7: 결과 확인

- **성공한 경우**: 
  - 위쪽 로그 영역에 결과가 표시됩니다
  - 예: `{message: "NCS 능력단위 검색 시스템 API 서버", ...}`

- **실패한 경우**:
  - 빨간색 에러 메시지가 표시됩니다
  - 예: `404 Not Found` 또는 `CORS error`

---

## 실제 테스트 코드

### 테스트 1: 서버 상태 확인

Console에 다음 코드를 입력하고 Enter:

```javascript
fetch('https://ncssearch-backend-production.up.railway.app/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 테스트 2: 회원가입 API 테스트

Console에 다음 코드를 입력하고 Enter:

```javascript
fetch('https://ncssearch-backend-production.up.railway.app/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test' + Date.now() + '@test.com',
    password: 'test123',
    name: '테스트'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 화면 구성 설명

```
┌─────────────────────────────────────────┐
│  브라우저 주소창                          │
├─────────────────────────────────────────┤
│                                          │
│  웹페이지 내용                           │
│                                          │
├─────────────────────────────────────────┤
│  [Elements] [Console] [Sources] ...     │ ← 탭 메뉴
├─────────────────────────────────────────┤
│  (로그가 표시되는 영역)                   │
│  > fetch(...)                            │
│  {message: "...", ...}                   │ ← 결과
│                                          │
├─────────────────────────────────────────┤
│  > _                                     │ ← 입력 영역 (여기에 입력!)
└─────────────────────────────────────────┘
```

---

## 주의사항

1. **코드 전체를 한 번에 입력**: 여러 줄이어도 한 번에 붙여넣기 가능
2. **Enter 키 한 번만 누르기**: 코드 입력 후 Enter 한 번
3. **결과 기다리기**: 네트워크 요청이므로 1-2초 걸릴 수 있습니다
4. **에러가 나도 괜찮음**: 에러 메시지도 중요한 정보입니다

---

## 문제 해결

### Console 탭이 안 보여요
- 개발자 도구 창 크기를 조절해보세요
- 탭이 숨겨져 있을 수 있습니다

### 코드를 입력했는데 아무 일도 안 일어나요
- Enter 키를 눌렀는지 확인
- 코드 끝에 세미콜론(;)이 있는지 확인
- 코드 전체가 제대로 입력되었는지 확인

### 에러가 나요
- 에러 메시지를 읽어보세요
- CORS 에러: 서버 설정 문제
- 404 에러: 경로가 없음
- 500 에러: 서버 내부 오류

---

## 더 쉬운 방법: test-api.html 사용

Console 사용이 어렵다면:
1. 프로젝트 폴더에서 `test-api.html` 파일을 더블클릭
2. 브라우저에서 열림
3. 버튼 클릭으로 테스트

이 방법이 더 간단합니다!

