/**
 * Thang màu sắc thống nhất cho điểm số tổng hợp (1 - 10)
 * Dùng chung cho Badges, Progress Bars và Markers trên bản đồ.
 */

export const getScoreColorHex = (score) => {
  const num = Number(score) || 0;
  if (num >= 8) return '#10b981'; // Emerald
  if (num >= 5) return '#f59e0b'; // Amber
  return '#f43f5e'; // Rose
};

export const getScoreColorTailwind = (score) => {
  const num = Number(score) || 0;
  if (num >= 8) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      accent: 'emerald'
    };
  }
  if (num >= 5) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      accent: 'amber'
    };
  }
  return {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    accent: 'rose'
  };
};
