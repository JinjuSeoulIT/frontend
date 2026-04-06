# Reception Detail UI Checklist (4 Flows)

- 기준일: 2026-03-13
- 대상: `yarn dev` 실행 후 접수 화면 수동 검증
- 범위: 외래/응급/예약/입원 상세 진입 + 확장 데이터 패널 노출

## 1) 사전 조건

- [ ] 프론트 실행: `http://localhost:3001`
- [ ] 백엔드 실행: `http://localhost:8283`
- [ ] 로그인 완료 후 `http://localhost:3001/reception/dashboard` 진입
- [ ] 각 리스트에 최소 1건 이상 데이터 존재

## 2) 공통 합격 기준

- [ ] 대시보드에서 4개 카드(외래/응급/예약/입원) 모두 노출
- [ ] 리스트 -> 상세 보기 클릭 시 404 없이 상세 페이지로 이동
- [ ] 상세 페이지에서 기존 버튼(뒤로/수정/상태변경) 동작 유지
- [ ] 상세 하단에 `확장 데이터` 카드가 자동 조회됨
- [ ] 확장 API 일부가 404여도 화면 전체는 정상 렌더링(경고 Alert만 표시)

## 3) 동선별 체크

### A. 외래 접수

- [ ] 대시보드: `외래 접수` 클릭
- [ ] URL: `/reception/outpatient/list`
- [ ] 리스트에서 `상세 보기` 클릭
- [ ] URL: `/reception/outpatient/detail/{receptionId}`
- [ ] 상세 하단에 `접수 확장 데이터` 노출
- [ ] 아래 테이블 카드가 보임
- [ ] `RECEPTION_QUALIFICATION_SNAP`
- [ ] `RECEPTION_QUALIFICATION_ITEM`
- [ ] `RECEPTION_CALL_HISTORY`
- [ ] `RECEPTION_VISIT_CLOSURE`
- [ ] `RECEPTION_CLOSURE_REASON`
- [ ] `RECEPTION_VISIT_CLOSURE_HIS`
- [ ] `RECEPTION_SETTLEMENT_SNAPSHOT`
- [ ] `RECEPTION_AUDIT`

### B. 응급 접수

- [ ] 대시보드: `응급 접수` 클릭
- [ ] URL: `/reception/emergency/list`
- [ ] 리스트에서 `상세 보기` 클릭
- [ ] URL: `/reception/emergency/detail/{receptionId}`
- [ ] 상세 하단에 `접수 확장 데이터` 노출
- [ ] 외래와 동일한 8개 접수 확장 테이블 카드 노출

### C. 예약 접수

- [ ] 대시보드: `예약 접수` 클릭
- [ ] URL: `/reception/appointment/list`
- [ ] 리스트에서 `상세 보기` 클릭
- [ ] URL: `/reception/appointment/detail/{reservationId}`
- [ ] 상세 하단에 `예약 확장 데이터` 노출
- [ ] 아래 테이블 카드가 보임
- [ ] `RESERVATION_STATUS_HISTORY`
- [ ] `RESERVATION_DOCTOR_SCHEDULE`
- [ ] `RESERVATION_TIME_SLOT`
- [ ] `RESERVATION_BOOKING_RULE`
- [ ] `RESERVATION_TO_RECEPTION_HIS`

### D. 입원 접수

- [ ] 대시보드: `입원 접수` 클릭
- [ ] URL: `/reception/admission/list`
- [ ] 리스트에서 `상세 보기` 클릭
- [ ] URL: `/reception/admission/detail/{receptionId}`
- [ ] 상세 하단에 `입원 확장 데이터` 노출
- [ ] 아래 테이블 카드가 보임
- [ ] `INPATIENT_ADMISSION_DECISION`
- [ ] `INPATIENT_BED_ASSIGNMENT_HIS`
- [ ] `INPATIENT_ADMISSION_AUDIT`

## 4) 네트워크 확인 (선택)

- [ ] 브라우저 DevTools > Network에서 상세 페이지 진입 직후 확장 API 호출 확인
- [ ] 접수 상세: `/api/receptions/{id}/...`
- [ ] 예약 상세: `/api/reservations/{id}/...`
- [ ] 입원 상세: `/api/inpatient-receptions/{id}/...`

## 5) 회귀 확인

- [ ] 대시보드에서 `확장 테이블` 단독 카드는 더 이상 보이지 않음
- [ ] `/reception/extensions` 접근 시 `/reception/dashboard`로 리다이렉트
- [ ] 기존 핵심 CRUD 화면 레이아웃 깨짐 없음
