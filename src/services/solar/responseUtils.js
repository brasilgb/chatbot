function normalizeBidata(bidata) {
  if (!bidata) {
    return []
  }

  if (Array.isArray(bidata)) {
    return bidata
  }

  if (typeof bidata === 'object') {
    return [bidata]
  }

  return []
}

export { normalizeBidata }
export default { normalizeBidata }
