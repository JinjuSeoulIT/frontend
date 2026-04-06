// 전화번호 자동 포맷
export const formatPhoneKR = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};




// 생년월일 6자리 정리
export const sanitizeBirthDate = (raw: string): string => {
  return raw.replace(/\D/g, "").slice(0, 6);
};

// 성별코드 1자리 정리
export const sanitizeGenderCode = (raw: string): string => {
  return raw.replace(/\D/g, "").slice(0, 1);
};