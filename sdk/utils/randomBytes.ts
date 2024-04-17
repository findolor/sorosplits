export const randomBytes = () => {
  const buffer = Buffer.alloc(32)
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.floor(Math.random() * 256)
  }
  return buffer
}
