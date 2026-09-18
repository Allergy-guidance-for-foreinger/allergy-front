# 웹 전환 검토 및 검증 결과

검증일: 2026-09-18. Expo SDK 54 / React Native 0.81 / React Native Web 0.21.

## 수정 사항

| 점검 대상 | 기존 문제 / 변경 내용 |
| --- | --- |
| 인증 저장소 | 웹 미지원 SecureStore 직접 호출을 플랫폼 어댑터로 교체. 웹은 AsyncStorage(localStorage), iOS/Android는 SecureStore 유지. 로그인·갱신·복원·로그아웃·인증 만료가 동일 어댑터 사용. 새 로그인에 refresh token이 없으면 이전 값을 삭제. |
| 사용자 설정 | `app-storage-b`, 버전 6, 기존 migrate 유지. 앱 마운트 이후 rehydrate, 잘못된 JSON에서도 로딩 해제. 저장소 차단/용량 초과 시 설정은 메모리에서 유지. 인증 토큰 저장 실패는 숨기지 않음. |
| 초기 렌더링 | 정적 웹 빌드에는 브라우저 저장소가 없으므로 세션 복원 전 공통 로딩 화면 표시. 초기 입력 경합과 서버/브라우저 hydration 불일치 방지. 전역 CSS를 루트에서 로드. |
| Google 로그인 | 네이티브 GoogleSignin 및 DeviceInfo를 플랫폼 컴포넌트로 격리. 웹은 Google Identity Services 버튼과 브라우저별 UUID 사용. ID token 로그 제거. |
| 스캔 카메라 | 웹은 getUserMedia/video/canvas 사용. HTTPS/지원 여부/권한 거부/장치 없음/장치 사용 중 오류 표시. 재시도 제공. 네이티브는 Expo Camera 유지. |
| 카메라 수명 | 탭 이탈, 결과 화면 이동, 전후면 전환, 브라우저 문서 숨김 시 트랙 종료. 권한 응답이 늦게 도착해도 이미 떠난 화면의 스트림 종료. 로그인 전에는 미리보기 시작하지 않음. |
| 사진 선택·업로드 | 권한 거부 시에도 갤러리 사용 가능. 웹 파일 선택은 클릭 직후 실행. data/blob URL을 Blob으로 변환해 multipart 바이트 전송. 네이티브 URI 업로드 유지. 카메라 준비 전 촬영 금지, 중복 작업 방지. |
| 식단 페이지 전환 | 네이티브 전용 PagerView를 어댑터로 교체. 웹은 탭 선택 및 터치 좌우 전환 제공. 사용자의 기존 main.tsx 변경 유지. |
| 알림 | React Native Web의 비동작 Alert 대신 브라우저 alert/confirm 어댑터 사용. 확인/취소 콜백 유지. |
| 번들 | Zustand ESM의 import.meta가 브라우저 실행을 막는 문제를 Babel의 unstable_transformImportMeta로 해결. |

## 실행

```sh
npm run web
npm run typecheck
npm run lint
npm run build:web
```

`build:web`는 정적 결과를 `dist/`에 생성한다. 호스팅에서 `/camera`와 `/settings/language` 같은 확장자 없는 경로를 해당 `.html` 파일로 매핑해야 한다. 테스트 서버는 이 매핑을 적용한다.

## 자동 브라우저 테스트

Chrome과 Playwright가 필요하다. Playwright가 없는 환경에서는 기존 의존성 변경 없이 다음처럼 준비할 수 있다.

```sh
npm install --no-save --package-lock=false playwright
npm run build:web
npm run test:web
```

이미 설치된 별도 Playwright를 사용할 때는 `PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run test:web`을 사용한다. 이번 검증에서는 환경에 제공된 Playwright를 사용했고 프로젝트의 의존성/lockfile은 변경하지 않았다.

테스트 코드는 `tests/web-smoke.cjs`, 재실행 결과는 `.test-results/web/`에 생성된다. 이번 실행 기록은 [JSON](web-validation/web-test-results.json)에 저장했다.

- Google credential 콜백 → 모의 로그인 API → 토큰 영구 저장
- 웹 식단 Dinner 탭 전환
- 언어 변경 후 서버 설정 API가 실패해도 새로고침 시 저장된 한국어 복원
- 스캔 탭에서 영상 생성, 전후면 전환 후 이전 트랙 종료
- 촬영 → multipart boundary/파일명/이미지 바이너리 확인 → 결과 화면 → 카메라 종료
- 결과에서 뒤로가기, 메뉴 탭 이동, 스캔 탭 재진입 시 카메라 수명 확인
- 401 → 단일 refresh → 두 토큰 교체 → 로그아웃 삭제 → 새로고침 후 로그인 화면
- 잘못된 저장 JSON에서도 초기화 완료
- localStorage 차단 상태에서도 로그인 화면 표시
- v5 religiousCode → v6 religiousCodes 마이그레이션
- 카메라 권한 거부 시 안내·촬영 비활성화·갤러리 업로드
- 카메라 없음 시 안내·촬영 비활성화·갤러리 업로드
- 탭 이탈 이후 도착한 카메라 요청 결과의 트랙 종료

결과: **13/13 통과**. TypeScript 오류 0. ESLint 오류 0, 기존 경고 6개. 정적 웹 export 경로 22개 생성 성공.

[가상 카메라 화면](web-validation/web-camera.png) · [촬영 분석 결과 화면](web-validation/web-scan-result.png)

## 검증 범위와 운영 설정

- 테스트는 실제 Chrome 브라우저에서 실행했지만 영상 장치는 Chromium의 가상 카메라다. 물리 웹캠/모바일 후면 카메라, Safari/iOS/Android 실기기는 별도 확인이 필요하다. 전후면 요청은 ideal 조건이므로 하나의 카메라만 있는 장치는 같은 카메라로 돌아갈 수 있다.
- Google SDK 및 백엔드 응답은 테스트에서 모의 처리했다. 실제 Google 계정 로그인, 운영 API의 CORS, 실제 AI 분석 성공 여부는 검증하지 않았다.
- 운영 카메라에는 HTTPS가 필요하다. 개발 시 localhost 사용 가능. iframe이면 호스트의 camera 권한 정책과 allow 속성도 확인한다.
- `.env`의 `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WEB_CLIENT_ID`를 실제 값으로 설정하고 Google OAuth의 Authorized JavaScript origins에 개발/배포 origin을 등록한다. 백엔드는 해당 origin, Authorization 및 Content-Type 헤더와 필요한 HTTP 메서드를 CORS에서 허용해야 한다.
- AsyncStorage는 웹에서 같은 origin의 localStorage를 사용한다. 프로토콜·호스트·포트가 달라지면 저장소가 별개다. 기존 앱의 SecureStore 데이터를 브라우저로 자동 이관할 수 없으며 최초 웹 사용 시 다시 로그인해야 한다.
- 웹 토큰은 JavaScript에서 읽을 수 있는 저장소에 저장된다. 네이티브 Keychain과 동일한 보안 수준이 아니다. HttpOnly cookie 기반 세션으로 바꾸려면 백엔드 인증 계약 변경이 필요하다.
- 저장 차단/용량 초과 시 사용자 설정은 현재 세션에서만 유지된다. 복구 후 새로고침이 필요하다. 브라우저의 알림/확인 창은 OS 기본 버튼 문구를 사용한다.
- 정적 HTML은 초기 로딩 UI이며 로그인 후 데이터는 브라우저에서 렌더링한다. 로그인된 개인 화면의 사전 렌더링/SEO는 제공하지 않는다.

## 확인한 공식 자료

- [Expo SDK 54 Camera](https://docs.expo.dev/versions/v54.0.0/sdk/camera/)
- [AsyncStorage v2](https://react-native-async-storage.github.io/2.0/)
- [Google Identity Services 버튼](https://developers.google.com/identity/gsi/web/guides/display-button)
- Babel 변환 옵션과 AsyncStorage의 실제 localStorage 구현은 설치된 node_modules 소스와 함께 확인했다.
