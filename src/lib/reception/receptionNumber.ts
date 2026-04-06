type AutoNumberOptions = {
  existingNumbers: Array<string | null | undefined>;
  startSequence: number;
  now?: Date;
};

const pad = (value: number) => String(value).padStart(2, "0");

export const formatDateToken = (now: Date = new Date()) => {
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  return `${year}${month}${day}`;
};

export const buildNextReceptionNumber = ({
  existingNumbers,
  startSequence,
  now = new Date(),
}: AutoNumberOptions) => {
  const dateToken = formatDateToken(now);
  const pattern = new RegExp(`^${dateToken}-(\\d{3})$`);

  const maxSequence = existingNumbers.reduce((max, value) => {
    const trimmed = value?.trim();
    if (!trimmed) return max;
    const match = trimmed.match(pattern);
    if (!match) return max;
    const sequence = Number(match[1]);
    if (Number.isNaN(sequence)) return max;
    if (sequence < startSequence) return max;
    return Math.max(max, sequence);
  }, startSequence - 1);

  const next = maxSequence + 1;
  return `${dateToken}-${String(next).padStart(3, "0")}`;
};
