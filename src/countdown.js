export function getCountdownParts(targetDate, now = new Date()) {
  const target = new Date(targetDate).getTime();
  const current = now.getTime();
  const diff = Math.max(0, target - current);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isOpen: diff === 0
  };
}
