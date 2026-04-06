# Reception 500 장애 대응 런북 (8181)

## 1) 현재 증상
- 정상(200): `/api/menus`, `/api/patients`, `/api/consent-types`
- 오류(500): `/api/receptions`, `/api/reception/history`, `/api/receptions/{id}/status-history`, `/actuator/health`
- 결론: **접수(reception) 도메인 백엔드 내부 장애**

## 2) 즉시 확인 명령
서버(또는 점프호스트)에서 실행:

```bash
curl -i http://192.168.1.60:8181/api/receptions
curl -i http://192.168.1.60:8181/api/reception/history
curl -i http://192.168.1.60:8181/api/receptions/1/status-history
curl -i http://192.168.1.60:8181/actuator/health
```

## 3) 500 원인 추적 순서
1. 애플리케이션 로그 확인  
   - `NullPointerException`, `SQLGrammarException`, `DataAccessException`, `Table not found`, `column ... not found` 우선 탐색
2. DB 연결/스키마 확인  
   - 접수 관련 테이블/컬럼 존재 여부
   - 마이그레이션(Flyway/Liquibase) 적용 여부
3. 배포 환경변수 확인  
   - `SPRING_PROFILES_ACTIVE`
   - datasource URL/user/password
   - 접수 서비스가 분리된 경우 서비스 URL
4. 라우팅/게이트웨이 확인  
   - `/api/receptions*`가 올바른 upstream으로 전달되는지
5. 헬스체크 상세 확인  
   - health 세부 원인(DB DOWN, 의존 서비스 DOWN 등)

## 4) 빠른 복구 우선순위
1. 최근 정상 버전으로 롤백 (가장 빠름)
2. DB 마이그레이션 재적용 후 재기동
3. 접수 도메인 의존 서비스/라우팅 복구

## 5) 복구 완료 기준 (필수)
아래가 모두 200 + 정상 body 여야 함:
- `/api/receptions`
- `/api/reception/history` 또는 `/api/receptions/{id}/status-history`
- `/actuator/health`

그리고 프론트에서:
- `/reception`
- `/reception/history`

정상 로딩 확인.

## 6) 백엔드팀 전달 템플릿
아래 그대로 전달:

```text
[장애 요약]
- 8181 서버에서 reception 계열 API 500 발생
- patients/menus/consent-types는 200 정상

[실패 API]
- GET /api/receptions
- GET /api/reception/history
- GET /api/receptions/{id}/status-history
- GET /actuator/health

[요청 사항]
1) 위 API 호출 시점 서버 로그(스택트레이스) 공유
2) 접수 도메인 DB 마이그레이션 적용 여부 확인
3) datasource/env/profile 값 점검
4) /api/receptions* 라우팅 대상 서비스 상태 점검
5) 복구 후 3개 엔드포인트 200 응답 캡처 공유
```

## 7) 프론트 임시 우회(이미 적용됨)
- `visitHistoryApi.ts`에서 8181 실패 시 fallback base로 재시도하도록 구현됨
- 단, 이는 임시 우회이며 **근본 해결은 백엔드 500 제거**
