# Backend API Test Cases (400/404)

## 목적
- 예약/접수 API에서 `400`, `404` 오류가 의도대로 반환되는지 검증
- 프론트 화면 통합 확인 시 재현 가능한 기준 케이스 제공

## 공통
- Base URL: `http://localhost:8283`
- Content-Type: `application/json`
- 응답 포맷(예상):
  - `success: false`
  - `message: string`
  - `result.status: number`
  - `result.code: string`
  - `result.message: string`

## TC-400-RESERVATION-CREATE-REQUIRED
- 설명: 예약 생성 시 필수값 누락 검증
- 요청:
  - Method: `POST`
  - Path: `/api/reservations`
  - Body: `{}`
- 기대 결과:
  - HTTP `400`
  - 에러 코드: `BAD_REQUEST`
  - 메시지 예시: `예약번호는 필수입니다.`
- 예시 명령:
```bash
curl -s -X POST "http://localhost:8283/api/reservations" \
  -H "Content-Type: application/json" \
  -d "{}" \
  -w "\nHTTP_STATUS:%{http_code}\n"
```

## TC-404-RECEPTION-DETAIL-NOT-FOUND
- 설명: 존재하지 않는 접수 ID 조회
- 요청:
  - Method: `GET`
  - Path: `/api/receptions/999999999`
- 기대 결과:
  - HTTP `404`
  - 에러 코드: `RECEPTION_NOT_FOUND`
  - 메시지 예시: `접수 ID 999999999에 해당하는 접수 정보가 없습니다.`
- 예시 명령:
```bash
curl -s "http://localhost:8283/api/receptions/999999999" \
  -w "\nHTTP_STATUS:%{http_code}\n"
```

## TC-404-RECEPTION-STATUS-NOT-FOUND
- 설명: 존재하지 않는 접수 ID의 상태 변경
- 요청:
  - Method: `PATCH`
  - Path: `/api/receptions/999999999/status`
  - Body: `{"status":"COMPLETED"}`
- 기대 결과:
  - HTTP `404`
  - 에러 코드: `RECEPTION_NOT_FOUND`
  - 메시지 예시: `접수 ID 999999999에 해당하는 접수 정보가 없습니다.`
- 예시 명령:
```bash
curl -s -X PATCH "http://localhost:8283/api/receptions/999999999/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"COMPLETED\"}" \
  -w "\nHTTP_STATUS:%{http_code}\n"
```

## 확인 체크리스트
- [ ] HTTP status가 기대값(400/404)과 일치
- [ ] `result.code`가 도메인 에러 코드와 일치
- [ ] `message`, `result.message`가 사용자/로그 용도로 충분히 명확
- [ ] 프론트에서 코드 포함 형태(`[400] ...`, `[404] ...`)로 표시 가능

## 참고
- 상태 전이 실패(예: 잘못된 전이)는 현재 일부 케이스에서 `500`으로 관찰됨
- 전이 검증 실패는 `400` 계열로 내려오도록 백엔드 예외 매핑 정책 점검 필요
