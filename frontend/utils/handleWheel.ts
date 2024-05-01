export const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
  const { deltaY } = event
  const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
  if (
    (scrollTop === 0 && deltaY < 0) ||
    (scrollTop + clientHeight >= scrollHeight && deltaY > 0)
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
}
