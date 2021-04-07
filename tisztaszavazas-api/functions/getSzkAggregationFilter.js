const instanceOf = (elem, constructorName = 'Object') => (
  elem instanceof Object &&
  Object.getPrototypeOf(elem).constructor.name == constructorName
)

module.exports = query => {
	let [_, filterCond] = Object.entries(query).reduce(
		(acc, [key, value]) => {
			if (key.includes('kozteruletek.')){
				return [ acc[0], { ...acc[1], [key]: value } ]
			}
			return [ {...acc[0], [key]: value }, acc[1] ]
		},
		[{}, {}] 
	)

	let regexStreetToFilter = null;

	filterCond = Object.entries(filterCond).reduce((acc = [], [key, value]) => {
		if (instanceOf(value, 'Object')) {
			const [operator, value2] = Object.entries(value)[0]
			return [...acc, { [operator]: [ `$$${key}`, value2 ]  }]
		}
		if (instanceOf(value, 'RegExp')) {
			regexStreetToFilter = { ...regexStreetToFilter, [key.replace('kozteruletek.', '')]: value }
			return acc
		}
		return [...acc, { $eq: [ `$$${key}`, value ]  }]
	}, [])

	return [filterCond, regexStreetToFilter]
}