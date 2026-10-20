module.exports = {
  target: (packageName) => {
    if (['typescript'].includes(packageName)) {
      return 'minor'
    }
    if ([].includes(packageName)) {
      return 'patch'
    }
    return 'latest'
  },
}
