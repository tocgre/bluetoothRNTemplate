export function calculateLastSeen (date: Date): Number {
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / 1000)
}
