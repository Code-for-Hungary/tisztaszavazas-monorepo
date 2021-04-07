module.exports = string => {
  let result = string.replace(/\n/g, " ")
  eval(`result = JSON.stringify(${result})`)
  result = JSON.parse(result)
  return result
}