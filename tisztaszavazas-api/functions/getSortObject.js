module.exports = (sortString = '') => sortString.split(',').reduce((acc = {}, field) => {
	let order = 1;
	if (field.startsWith('-')){
		field = field.slice(1)
		order = -1
	}
	return {...acc, [field]: order}
}, {})