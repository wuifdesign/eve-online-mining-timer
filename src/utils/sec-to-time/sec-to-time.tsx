export const secToTime = (value: number): string => {
  const minutes = Math.floor(value / 60)
  const seconds = Math.round(value - minutes * 60)
  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}
