# 신규 진료 시작 버튼 동적 흐름 설명

## 시작 지점 (프론트)

`Clinical.tsx`의 `handleStartNewClinical`에서 흐름이 시작된다.

```tsx
const handleStartNewClinical = React.useCallback(async () => {
  if (!selectedReception) {
    window.alert("접수 환자를 먼저 선택해 주세요.");
    return;
  }
  if (creatingClinicalRef.current) return;
  creatingClinicalRef.current = true;
  setCreatingClinical(true);
  try {
    setErrorMessage(null);
    await startVisitApi(selectedReception.receptionId);
    await Promise.all([loadData(), loadReceptionQueue()]);
    setSelectedPatientId(selectedReception.patientId);
    setSelectedReception((prev) => {
      if (!prev) return prev;
      return { ...prev, status: "IN_PROGRESS" };
    });
    window.alert("진료가 시작되었습니다.");
  } catch (err) {
    const message =
      err instanceof Error
        ? isNetworkError(err)
          ? clinicalConnectionMessage()
          : err.message
        : "진료 시작에 실패했습니다.";
    setErrorMessage(message);
    window.alert(message);
  } finally {
    creatingClinicalRef.current = false;
    setCreatingClinical(false);
  }
}, [selectedReception, loadData, loadReceptionQueue]);
```

## 중요한 문법과 의미

1. `if (!selectedReception) return`
   - 가드(Guard) 로직.
   - 환자 선택 없이 API 호출되지 않게 방지한다.

2. `creatingClinicalRef.current`
   - `useRef`로 중복 클릭 방지 플래그를 유지한다.
   - 렌더링과 무관하게 즉시 값이 유지되므로, 더블 클릭에 강하다.

3. `await startVisitApi(...)`
   - 실제 진료 시작 API 호출.
   - 접수 ID를 서버에 넘겨 "진료 시작 트랜잭션"을 실행한다.

4. `await Promise.all([loadData(), loadReceptionQueue()])`
   - 진료 데이터와 접수 목록을 병렬 재조회.
   - 화면 상태를 한 번에 최신화한다.

5. `setSelectedReception((prev) => ({ ...prev, status: "IN_PROGRESS" }))`
   - 로컬 UI 상태를 즉시 반영해 사용자가 상태 변화를 바로 체감하게 한다.

6. `try / catch / finally`
   - 성공/실패/정리 단계를 명확히 분리한다.
   - 실패해도 `finally`에서 로딩 플래그를 반드시 해제한다.

## 프론트 API 계층

`visitApi.ts`의 `startVisitApi`가 호출된다.

```ts
export async function startVisitApi(
  receptionId: number,
  changedBy?: number | null
): Promise<{ visitId: number }> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinical/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receptionId, changedBy: changedBy ?? undefined }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `진료 시작 실패 (${res.status})`);
  }
  const body = (await res.json()) as { success?: boolean; result?: { visitId: number } };
  const result = body?.result;
  if (!result?.visitId) throw new Error("진료 시작 응답이 올바르지 않습니다.");
  return result;
}
```

핵심:
- 엔드포인트: `POST /api/clinical/start`
- 요청 바디: `receptionId`, `changedBy`
- 응답 검증: `visitId`가 없으면 예외

## 백엔드 진입점

`ClinicalController.start()`가 프론트 요청을 받는다.

```java
@PostMapping("/start")
public ResponseEntity<ApiResponse<VisitStartResponse>> start(@Valid @RequestBody VisitStartRequest request) {
    VisitStartResponse result = VisitStartResponse.from(encounterService.startVisit(request));
    return ResponseEntity.status(201).body(new ApiResponse<>(true, "진료 시작 성공", result));
}
```

## 백엔드 핵심 비즈니스 (서비스)

`EncounterServiceImpl.startVisit()`에서 실제 트랜잭션이 수행된다.

순서:
1. 접수 조회 (`receptionClient.getReception`)
2. 접수 상태 검증 (`WAITING`, `CALLED`만 허용)
3. 이미 시작된 방문 중복 체크 (`receptionId + IN_PROGRESS`)
4. 접수 상태를 `IN_PROGRESS`로 PATCH
5. Visit 생성 (`Visit.create(..., "IN_PROGRESS")`)
6. 방문 상태 이력 저장 (`VisitStatusHistory`)

## 접수 서비스 연동 클라이언트

`ReceptionClient`에서 외부 접수 서비스 호출:
- `getReception`: `GET /api/receptions/{id}`
- `updateReceptionStatus`: `PATCH /api/receptions/{id}/status`

즉 프론트는 접수 서비스를 직접 호출하지 않고, 임상(Clinical) 백엔드가 오케스트레이션을 담당한다.

## 최종 사용자 체감 흐름

1. 대기 환자 선택
2. 신규 진료 시작 클릭
3. 접수 상태 `IN_PROGRESS` 전환
4. Visit 생성
5. 화면 재조회로 목록/상태/입력영역 동기화

이 흐름 덕분에 "버튼 클릭 한 번"으로 접수 상태 전환과 진료 시작이 일관되게 연결된다.

