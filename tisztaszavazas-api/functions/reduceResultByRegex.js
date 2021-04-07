const filterKozteruletekByRegex = (kozteruletek, regexStreetToFilter) => {
	if (!regexStreetToFilter || !Object.keys(regexStreetToFilter).length){
		return kozteruletek
	}

	return kozteruletek.filter(kozterulet => (
		Object.entries(regexStreetToFilter).reduce((acc, [key, value]) => (
			acc && kozterulet[key] && kozterulet[key].match(value)
		),true)
	))	
}

module.exports = (result, regexStreetToFilter, projection) => {
	return result.reduce((acc = [], entry) => {
		if ((projection.kozteruletek !== 0 || projection.kozteruletek === 1) && (!entry.kozteruletek || !entry.kozteruletek.length)) {
			return acc
		}
		if (projection.kozteruletek === 0) {
			return [...acc, entry]
		}

		const kozteruletek = filterKozteruletekByRegex(entry.kozteruletek, regexStreetToFilter)

		const { _id, kozteruletek: kt, ...entryRest } = entry;
		if (kozteruletek.length) return [...acc, { _id, kozteruletek, ...entryRest }]
		return acc
	}, [])
}