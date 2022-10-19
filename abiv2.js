function abiv2 (a, shouldRenderBigNumber = false) {
  if (!Array.isArray(a)) {
    if (a._isBigNumber && shouldRenderBigNumber) {
      if (typeof shouldRenderBigNumber === 'string') {
        return a[shouldRenderBigNumber]()
      } else {
        return a.toHexString()
      }
    }
    return a
  }
  const o = {}
  const keys = Object.keys(a).slice(a.length)
  if (!keys.length) {
    return a.map(b => abiv2(b, shouldRenderBigNumber))
  }
  keys.forEach(n => {
    o[n === '_length' ? 'length' : n] = abiv2(a[n], shouldRenderBigNumber)
  })
  return o
}

export default abiv2
