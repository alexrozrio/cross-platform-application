export interface BadgeMeta {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  barColor: string;
  borderColor: string;
}

export const BADGE_META: Record<string, BadgeMeta> = {
  weekly_1st: {
    emoji: '🥇',
    title: 'Weekly Champion',
    subtitle: 'First place — Weekly Tournament',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    barColor: 'bg-yellow-400',
    borderColor: 'border-yellow-300',
  },
  weekly_2nd: {
    emoji: '🥈',
    title: 'Weekly Runner-up',
    subtitle: 'Second place — Weekly Tournament',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    barColor: 'bg-slate-400',
    borderColor: 'border-slate-300',
  },
  weekly_3rd: {
    emoji: '🥉',
    title: 'Weekly Third',
    subtitle: 'Third place — Weekly Tournament',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    barColor: 'bg-orange-400',
    borderColor: 'border-orange-300',
  },
  monthly_1st: {
    emoji: '🏆',
    title: 'Monthly Champion',
    subtitle: 'First place — Monthly Tournament',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    borderColor: 'border-amber-400',
  },
  monthly_2nd: {
    emoji: '🎖',
    title: 'Monthly Runner-up',
    subtitle: 'Second place — Monthly Tournament',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    barColor: 'bg-slate-400',
    borderColor: 'border-slate-300',
  },
  monthly_3rd: {
    emoji: '🎗',
    title: 'Monthly Third',
    subtitle: 'Third place — Monthly Tournament',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    barColor: 'bg-rose-400',
    borderColor: 'border-rose-300',
  },
};

export function formatPeriodLabel(period: string): string {
  if (period.includes('-W')) {
    const [yearStr, weekStr] = period.split('-W');
    return `Week ${parseInt(weekStr)}, ${yearStr}`;
  } else {
    const [yearStr, monthStr] = period.split('-');
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

export function badgeTypeLabel(type: string): string {
  return BADGE_META[type]?.title ?? type;
}
