# Vercel 빌드 오류 해결 가이드

## 수정된 내용

다음 오류들을 수정했습니다:

### 1. `User` 타입 import 오류
- ✅ `src/services/api.ts`: `User` 타입 import 추가
- ✅ `src/services/apiService.ts`: `User` 타입 import 추가
- ✅ import 경로를 명시적으로 `'../types/index'`로 변경

### 2. `import.meta.env` 타입 오류
- ✅ `src/vite-env.d.ts`: `ImportMetaEnv` 인터페이스 추가
- ✅ 전역 타입 선언으로 변경 (`declare global`)

### 3. `organizations` null 체크 오류
- ✅ `src/pages/LoginPage.tsx`: 3곳에 `(organizations || [])` 추가

### 4. 사용하지 않는 import
- ✅ `src/pages/SearchInputPage.tsx`: `Loading` import 제거

### 5. 빌드 설정
- ✅ `vite.config.ts`: `minify: 'esbuild'`로 변경 (terser 의존성 제거)
- ✅ `tsconfig.json`: `vite-env.d.ts` 포함 확인

## Vercel에서 재배포 방법

### 방법 1: GitHub에 푸시 (권장)

```bash
git add .
git commit -m "Fix TypeScript build errors for Vercel"
git push origin main
```

Vercel이 자동으로 새 배포를 시작합니다.

### 방법 2: Vercel에서 수동 재배포

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Deployments 탭
4. 최신 배포 클릭
5. "Redeploy" 버튼 클릭

### 방법 3: 빌드 캐시 클리어

Vercel에서:
1. 프로젝트 → Settings → General
2. "Clear Build Cache" 클릭
3. 재배포

## 확인 사항

배포 전 확인:
- [ ] 모든 변경사항이 GitHub에 푸시됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] TypeScript 오류 없음 (`npx tsc --noEmit`)

배포 후 확인:
- [ ] Vercel 빌드 로그에서 오류 없음
- [ ] 배포 상태가 "Ready"
- [ ] 애플리케이션이 정상 작동

## 문제가 계속되면

1. **Vercel 빌드 로그 전체 확인**
   - 프로젝트 → Deployments → 최신 배포 → Build Logs
   - 오류 메시지 전체 복사

2. **로컬 빌드와 비교**
   ```bash
   npm run build
   npx tsc --noEmit
   ```

3. **캐시 클리어 후 재배포**
   - Vercel에서 빌드 캐시 클리어
   - GitHub에 빈 커밋 푸시

4. **환경 변수 확인**
   - Vercel → Settings → Environment Variables
   - 필요한 환경 변수가 모두 설정되어 있는지 확인

