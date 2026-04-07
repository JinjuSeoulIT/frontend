# -*- coding: utf-8 -*-
import csv
import html as html_lib

BASE = __file__.rsplit("\\", 1)[0]
CSV_PATH = f"{BASE}/HIS_Clinical_story_export.csv"
MD_PATH = f"{BASE}/HIS_Clinical_story_구현대응표.md"
HTML_PATH = f"{BASE}/HIS_Clinical_story_구현대응표.html"


def load_rows():
    rows = []
    with open(CSV_PATH, encoding="utf-8-sig") as f:
        for r in csv.reader(f):
            if any(x.strip() for x in r):
                r = (list(r) + ["", "", "", ""])[:4]
                rows.append(r)
    return rows


def status_for(cat, name, _desc, _actor):
    n = name.strip()
    c = (cat or "").strip()
    partial = "부분"
    none_ = "미구현"

    def match(prefixes, keys, st, note=""):
        for p in prefixes:
            if p not in c and p not in n:
                continue
            if keys and not any(k in n for k in keys):
                continue
            return st, note
        return None

    m = match(["약 처방"], ["신규 등록"], partial, "SOAP 방문 처방 추가")
    if m:
        return m
    m = match(["약 처방"], ["목록 조회"], partial, "현재 방문 처방 목록")
    if m:
        return m
    m = match(["약 처방"], ["상세 조회"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["정보 수정"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["비활성"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["검색/필터"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["유효성"], partial, "기본 검증")
    if m:
        return m
    m = match(["약 처방"], ["변경 이력"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["권한"], none_, "")
    if m:
        return m
    m = match(["약 처방"], ["오류"], partial, "알림/토스트")
    if m:
        return m

    m = match(["검사 오더"], ["신규 등록"], partial, "검사 오더 다이얼로그")
    if m:
        return m
    m = match(["검사 오더"], ["목록 조회"], partial, "현재 방문 오더 목록")
    if m:
        return m
    m = match(["검사 오더"], ["상세 조회"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["정보 수정"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["비활성"], partial, "오더 취소")
    if m:
        return m
    m = match(["검사 오더"], ["검색/필터"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["정렬/페이징"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["PDF"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["엑셀"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["첨부"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["유효성"], partial, "")
    if m:
        return m
    m = match(["검사 오더"], ["변경 이력"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["권한"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["알림"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["일괄"], none_, "")
    if m:
        return m
    m = match(["검사 오더"], ["오류"], partial, "")
    if m:
        return m

    m = match(["처치"], ["신규 등록"], partial, "처치 다이얼로그")
    if m:
        return m
    m = match(["처치"], ["목록 조회"], partial, "통합 오더 목록")
    if m:
        return m
    m = match(["처치"], ["비활성"], partial, "취소")
    if m:
        return m
    m = match(["처치"], ["상세 조회"], none_, "")
    if m:
        return m
    m = match(["처치"], ["정보 수정"], none_, "")
    if m:
        return m
    m = match(["처치"], ["유효성"], partial, "")
    if m:
        return m
    m = match(["처치"], ["오류"], partial, "")
    if m:
        return m
    m = match(["처치"], ["검색/필터", "정렬", "PDF", "엑셀", "첨부", "변경 이력", "권한", "알림", "일괄"], none_, "")
    if m:
        return m

    m = match(["진료기록"], ["신규 등록"], partial, "진료 시작 시 방문")
    if m:
        return m
    m = match(["진료기록"], ["상세 조회"], partial, "방문 차트")
    if m:
        return m
    m = match(["진료기록"], ["목록 조회"], none_, "전역 목록 UI 없음")
    if m:
        return m
    m = match(["진료기록"], ["정보 수정"], partial, "주호소·현병력·메모 자동저장")
    if m:
        return m
    m = match(["진료기록"], ["비활성"], none_, "")
    if m:
        return m
    m = match(["진료기록"], ["검색/필터", "정렬", "PDF", "엑셀", "첨부", "일괄", "변경 이력", "권한", "알림"], none_, "")
    if m:
        return m
    m = match(["진료기록"], ["유효성"], partial, "")
    if m:
        return m
    m = match(["진료기록"], ["오류"], partial, "")
    if m:
        return m

    m = match(["진단"], ["신규 등록"], partial, "상병 추가")
    if m:
        return m
    m = match(["진단"], ["목록 조회"], partial, "현재 방문")
    if m:
        return m
    m = match(["진단"], ["상세 조회"], none_, "")
    if m:
        return m
    m = match(["진단"], ["정보 수정"], partial, "순서·주진단")
    if m:
        return m
    m = match(["진단"], ["비활성"], partial, "삭제")
    if m:
        return m
    m = match(["진단"], ["검색/필터", "정렬", "PDF", "엑셀", "첨부", "일괄", "변경 이력", "권한", "알림"], none_, "")
    if m:
        return m
    m = match(["진단"], ["유효성"], partial, "")
    if m:
        return m
    m = match(["진단"], ["오류"], partial, "")
    if m:
        return m

    m = match(["과거진료이력", "진료이력"], ["목록 조회"], partial, "과거 방문 모달")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["정렬/페이징"], partial, "과거 방문 페이지")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["상세 조회"], partial, "요약·노트")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["신규 등록"], none_, "카테고리와 불일치 검토")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["정보 수정", "비활성", "검색/필터", "정렬", "PDF", "엑셀", "첨부", "일괄", "변경 이력", "권한", "알림"], none_, "")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["유효성"], partial, "")
    if m:
        return m
    m = match(["과거진료이력", "진료이력"], ["오류"], partial, "")
    if m:
        return m

    if (c and "오더 정정" in c) or "오더 이력" in n:
        return none_, "전용 화면 없음"

    if "기록 정정" in n or (c and "기록 잠금" in c):
        return none_, "전용 화면 없음"

    return none_, ""


def main():
    rows = load_rows()
    out = []
    last_cat = ""
    for cat, name, desc, actor in rows:
        if cat and str(cat).strip():
            last_cat = str(cat).strip()
        st, note = status_for(last_cat, name, desc, actor)
        out.append([last_cat, name, desc, actor, st, note])

    lines = [
        "# HIS_Clinical_stroy.xlsx — 원문 추출 + 프론트 구현 대응",
        "",
        "원본: `C:/dev/Project_hospital/HIS_Clinical_stroy.xlsx` (sheet1, 137행×4열)",
        "",
        "## 엑셀 원문 + 구현 상태",
        "",
        "| 구분 | 기능명 | 설명(원문) | 주체 | 구현상태 | 비고 |",
        "|------|--------|------------|------|----------|------|",
    ]
    for r in out:
        esc = [str(x).replace("|", "\\|").replace("\n", " ") for x in r]
        lines.append("| " + " | ".join(esc) + " |")

    lines.extend(
        [
            "",
            "## 구현 기준으로 묶은 스토리(재정리)",
            "",
            "1. **접수·진료 진행**(엑셀에 없음): 접수 목록·진료 시작·상태·진료 완료 — `Clinical.tsx`, `ClinicalList`, `ClinicalEncounter`",
            "2. **차트 헤더·모달**: 바이탈·문진(한 줄 요약+입력), 과거력, 과거 진료 — `ClinicalChartCenter` 및 다이얼로그",
            "3. **SOAP 차트**: 주호소·현병력·메모 자동저장, 진단·처방, 진료완료 — `ClinicalSoapCard`",
            "4. **오더**: 검사·처치(시술·약) 생성, 방문별 목록·취소 — `ClinicalOrderDialog`, `ClinicalOrder`",
            "5. **과거 진료**: 목록·페이지, 주호소·현병력 반영, 처방 반복 — `ClinicalPastVisitsCard`",
            "",
            "## 엑셀 대비 추가·수정 제안",
            "",
            "- **추가(에픽)**: `접수·진료 진행`, `활력·문진(SOAP O/S)`, `과거력(PHx)` — 코드에 있으나 본 엑셀에 없음.",
            "- **추가**: 전역 목록·기간·키워드 검색·필터 저장 등은 엑셀에 있으나 Clinical 프론트는 대부분 미구현 → Phase 또는 별도 화면 명시.",
            "- **수정**: `과거진료이력 조회`와 `진료이력 신규/수정/비활성` 행은 업무 정의와 맞는지 검토(조회 전용이면 CRUD 행 정리).",
            "- **수정**: `약 처방 오더`와 SOAP `처방` 도메인 일치 여부를 엑셀에 명시(방문 처방 vs 원내 마스터).",
            "- **공통**: PDF·엑셀·첨부·이력·권한·알림은 엑셀에 다 있으나 프론트 대부분 미구현 → 백엔드/인프라 전제 열 추가 권장.",
        ]
    )

    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    thead = "<tr><th>구분</th><th>기능명</th><th>설명(원문)</th><th>주체</th><th>구현상태</th><th>비고</th></tr>"
    body = []
    for r in out:
        body.append(
            "<tr>"
            + "".join(f"<td>{html_lib.escape(str(x))}</td>" for x in r)
            + "</tr>"
        )

    html_doc = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>HIS Clinical Story — 구현대응표</title>
<style>
body {{ font-family: "Malgun Gothic", sans-serif; margin: 24px; font-size: 11px; }}
h1 {{ font-size: 18px; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ border: 1px solid #333; padding: 4px 6px; vertical-align: top; }}
th {{ background: #eee; }}
</style>
</head>
<body>
<h1>HIS_Clinical_stroy.xlsx — 구현 대응표</h1>
<table>
<thead>{thead}</thead>
<tbody>{"".join(body)}</tbody>
</table>
</body>
</html>"""

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_doc)

    print("OK", len(out))


if __name__ == "__main__":
    main()
