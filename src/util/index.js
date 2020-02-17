export default function mergeObjectDeeper(target, source) {
  for (let key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], mergeObjectDeeper(target[key], source[key]))
  }

  Object.assign(target || {}, source)
  return target
}