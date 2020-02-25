export function mergeObjectDeeper(target, source) {
  for (let key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], mergeObjectDeeper(target[key], source[key]))
  }

  Object.assign(target || {}, source)
  return target
}

export function getReducedValue(obj, excute) {
  return Object.keys(obj).reduce(excute, {});
}
