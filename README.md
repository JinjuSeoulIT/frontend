# HIS Patient Frontend

병원 업무 화면을 제공하는 Next.js 프론트엔드 프로젝트입니다.

현재 `feature/login` 브랜치에서는 로그인, 인증 상태 유지, 메뉴 조회, 개발용 우회 진입(dev bypass) 흐름을 중심으로 작업합니다.

## 실행 방법

```bash
npm install
npm run dev
```

실행 후 아래 주소로 접속합니다.

- `http://localhost:3001`

## 환경변수 설정

실제 실행 시에는 `.env.local` 파일이 필요합니다.

- `.env.local` : 각 개발자 로컬에서 실제로 사용하는 실행 설정 파일
- `.env.example` : 필요한 환경변수 키를 보여주는 예시 파일

예시:

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_jExPeJWYVQjgRQjvlGNor49R5gvN
NEXT_PUBLIC_AUTH_API_BASE_URL=http://192.168.1.64:8081
NEXT_PUBLIC_MENU_API_BASE_URL=http://192.168.1.64:8081
NEXT_PUBLIC_BILLING_API_BASE_URL=http://192.168.1.68:8081
NEXT_PUBLIC_STAFF_API_BASE_URL=http://192.168.1.58:8022
NEXT_PUBLIC_ENABLE_DEV_BYPASS=true

NEXT_PUBLIC_PATIENTS_API_BASE_URL=http://192.168.1.60:8181
NEXT_PUBLIC_RECEPTION_API_BASE_URL=http://192.168.1.55:8283
NEXT_PUBLIC_RECEPTION_FALLBACK_BASE_URL=http://192.168.1.55:8283
NEXT_PUBLIC_CLINICAL_API_BASE_URL=http://192.168.1.70:8090
NEXT_PUBLIC_NURSING_API_BASE_URL=http://192.168.1.66:8181
```

### 주요 환경변수 설명

- `NEXT_PUBLIC_AUTH_API_BASE_URL`
  - 로그인, 로그아웃, 사용자 인증 확인에 사용하는 인증 서버 주소입니다.

- `NEXT_PUBLIC_MENU_API_BASE_URL`
  - 로그인 이후 현재 사용자 기준 메뉴 목록을 조회할 때 사용하는 서버 주소입니다.

- `NEXT_PUBLIC_BILLING_API_BASE_URL`
  - 수납, 청구, 결제 관련 API를 호출할 때 사용하는 서버 주소입니다.

- `NEXT_PUBLIC_STAFF_API_BASE_URL`
  - 직원, 부서, 직책, 의료진 정보 관련 API를 호출할 때 사용하는 서버 주소입니다.

- `NEXT_PUBLIC_ENABLE_DEV_BYPASS`
  - `true`이면 로그인 화면에서 개발용 우회 진입 버튼을 사용할 수 있습니다.
  - `false`이면 일반 로그인만 사용할 수 있습니다.

## 로그인 검증 방법

### 일반 로그인

1. `/login` 화면에서 아이디와 비밀번호를 입력합니다.
2. 인증 서버의 `/api/auth/login`을 호출합니다.
3. 로그인 성공 시 프론트에서 세션 정보를 저장합니다.
4. 로그인 직후 `/api/menus`를 호출하여 현재 사용자 기준 메뉴를 조회합니다.
5. 이후 홈(`/`) 또는 비밀번호 변경 페이지로 이동합니다.

### 개발용 우회 진입

`NEXT_PUBLIC_ENABLE_DEV_BYPASS=true`일 때 로그인 화면에서 개발용 우회 진입 버튼이 노출됩니다.

이 기능은 다음 상황에서 사용합니다.

- 인증 서버가 불안정할 때 화면 개발 진행
- 로그인 절차와 별개로 프론트 화면 확인
- 보호 라우트 진입 확인

단, dev bypass를 사용해도 메뉴는 실제 백엔드 `/api/menus`를 호출합니다.
즉 화면 진입만 우회할 뿐, 메뉴 데이터는 인증/메뉴 서버가 정상이어야 표시됩니다.

## 인증 및 메뉴 동작 요약

로그인 이후 흐름은 아래와 같습니다.

1. 로그인 성공
2. 프론트 세션 저장
3. `/api/menus` 호출
4. 현재 사용자에게 허용된 메뉴만 조회
5. 사이드바 메뉴 출력
6. 보호 라우트 접근 시 proxy와 메뉴 권한 기준으로 검사

## 주의사항

- 이 프로젝트는 API 주소를 코드 내부에서 자동 추론하지 않습니다.
- 환경변수가 없으면 fallback으로 `localhost`를 사용하는 대신 오류가 발생하도록 구성되어 있습니다.
- 따라서 `.env.local` 설정이 누락되면 로그인, 메뉴, 수납, 직원 기능이 정상 동작하지 않을 수 있습니다.

## 트러블슈팅

### 로그인 후 화면 이동이 안 될 때

- `NEXT_PUBLIC_AUTH_API_BASE_URL` 값이 맞는지 확인합니다.
- 인증 서버가 실제로 실행 중인지 확인합니다.

### 메뉴가 보이지 않을 때

- `NEXT_PUBLIC_MENU_API_BASE_URL` 값이 맞는지 확인합니다.
- `/api/menus` 호출 결과가 `200`인지 확인합니다.
- dev bypass 상태라도 메뉴는 실제 백엔드에 의존합니다.

### 권한 없는 화면이 열릴 때

- 로그인 후 받아온 메뉴 목록과 현재 사용자 권한 설정을 확인합니다.
- 메뉴 숨김과 URL 직접 접근 차단이 모두 정상 동작하는지 함께 확인합니다.
