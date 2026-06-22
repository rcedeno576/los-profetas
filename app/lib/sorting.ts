// lib/sorting.ts

export function compareByPtsAndSeniority(
  a: { total_pts: number; joined_at: string },
  b: { total_pts: number; joined_at: string }
): number {
  const ptsDiff = b.total_pts - a.total_pts;
  if (ptsDiff !== 0) return ptsDiff;
  return a.joined_at.localeCompare(b.joined_at);
}

export function compareByPtsWonAndPtsAndSeniority(
  a: { points_won: number; total_pts: number; joined_at: string },
  b: { points_won: number; total_pts: number; joined_at: string }
): number {
  const ptsDiff = b.points_won - a.points_won;
  if (ptsDiff !== 0) return ptsDiff;
  return   compareByPtsAndSeniority(
    { total_pts: a.total_pts, joined_at: a.joined_at },
    { total_pts: b.total_pts, joined_at: b.joined_at }
  );
}

export function assignRanks<T extends { total_pts: number }>(
  members: T[]
): (T & { rank: number | null })[] {
  return members.map((member) => {
    if (member.total_pts === 0) return { ...member, rank: null }

    const rank = members.findIndex(m => m.total_pts === member.total_pts) + 1
    return { ...member, rank }
  })
}

export function getMedalOrPosition(rank: number | null, index: number): string {
  if (rank === null) return `${index + 1}.`
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}.`
}