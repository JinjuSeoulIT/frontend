import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

const onboardingSteps = [
  {
    title: "1. 로그인 시작",
    body: "아이디/비밀번호로 로그인합니다. 아이디 저장을 체크하면 다음 접속 시 자동으로 채워집니다.",
  },
  {
    title: "2. 회원가입 신청",
    body: "계정이 없으면 회원가입 신청에서 소셜 간편 가입 또는 일반 가입을 선택합니다. 일반 가입은 이메일 인증과 아이디 중복 확인이 필요합니다.",
  },
  {
    title: "3. 관리자 승인 후 사용",
    body: "가입 신청이 완료되면 관리자 승인 전까지 로그인할 수 없습니다. 승인 후 역할에 맞는 화면으로 자동 이동합니다.",
  },
] as const;

type OnboardingDialogProps = {
  open: boolean;
  step: number;
  onClose: (markSeen: boolean) => void;
  onStepChange: (step: number) => void;
  onStartRegister: () => void;
};

const renderPreview = (step: number) => {
  if (step === 0) {
    return (
      <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#0f172a", border: "1px solid rgba(148,163,184,0.28)" }}>
        <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>로그인 버튼 위치 미리보기</Typography>
        <Stack spacing={0.8}>
          <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)" }} />
          <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)" }} />
          <Box sx={{ height: 30, borderRadius: 1, bgcolor: "rgba(96,165,250,0.2)", border: "1px solid #60a5fa", color: "#bfdbfe", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
            로그인
          </Box>
        </Stack>
      </Box>
    );
  }

  if (step === 1) {
    return (
      <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#111827", border: "1px solid rgba(148,163,184,0.28)" }}>
        <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>회원가입 버튼/인증 버튼 미리보기</Typography>
        <Stack spacing={0.8}>
          <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)", display: "grid", placeItems: "center", color: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>
            회원가입
          </Box>
          <Stack direction="row" spacing={0.8}>
            <Box sx={{ flex: 1, height: 26, borderRadius: 999, bgcolor: "#03C75A", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>N</Box>
            <Box sx={{ flex: 1, height: 26, borderRadius: 999, bgcolor: "#fff", color: "#1f2937", border: "1px solid #d0d7de", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>G</Box>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#0f172a", border: "1px solid rgba(148,163,184,0.28)" }}>
      <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>승인 상태 안내 미리보기</Typography>
      <Stack spacing={0.8}>
        <Box sx={{ height: 26, borderRadius: 1, bgcolor: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.5)", color: "#fde68a", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
          가입 승인 대기
        </Box>
        <Box sx={{ height: 26, borderRadius: 1, bgcolor: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.5)", color: "#bbf7d0", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
          승인 후 로그인 가능
        </Box>
      </Stack>
    </Box>
  );
};

export default function OnboardingDialog({
  open,
  step,
  onClose,
  onStepChange,
  onStartRegister,
}: OnboardingDialogProps) {
  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 900 }}>HIS 빠른 온보딩</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={0.75}>
            {onboardingSteps.map((onboardingStep, idx) => (
              <Chip
                key={onboardingStep.title}
                size="small"
                label={`${idx + 1}`}
                color={idx === step ? "primary" : "default"}
                variant={idx === step ? "filled" : "outlined"}
                onClick={() => onStepChange(idx)}
              />
            ))}
          </Stack>
          <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(15,23,42,0.03)" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{onboardingSteps[step].title}</Typography>
            <Typography sx={{ mt: 0.7, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              {onboardingSteps[step].body}
            </Typography>
          </Box>
          {renderPreview(step)}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onClose(true)}>다시 보지 않기</Button>
        <Button onClick={() => onClose(false)}>닫기</Button>
        {step > 0 ? <Button onClick={() => onStepChange(step - 1)}>이전</Button> : null}
        {step < onboardingSteps.length - 1 ? (
          <Button variant="contained" onClick={() => onStepChange(step + 1)}>다음</Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              onClose(true);
              onStartRegister();
            }}
          >
            회원가입 신청하기
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
