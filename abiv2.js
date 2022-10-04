function abiv2 (a, shouldRenderBigNumber = false) {
  if (!Array.isArray(a)) {
    if (shouldRenderBigNumber && a._isBigNumber) return a.toNumber()
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
