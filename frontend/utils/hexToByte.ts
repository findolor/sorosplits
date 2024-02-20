export function hexToByte(hexString: string) {
  if (hexString.length % 2 !== 0) {
    throw "Must have an even number of hex digits to convert to bytes"
  }
  var numBytes = hexString.length / 2
  var byteArray = Buffer.alloc(numBytes)
  for (var i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return byteArray
}
