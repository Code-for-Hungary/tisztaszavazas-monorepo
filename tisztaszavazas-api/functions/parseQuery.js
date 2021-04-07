const toNumeric = string => {
  if (isNaN(+string)) {
    return undefined
  } else {
    return +string
  } 
}

const toRegex = string => {
	const parts = string.split('/')
	let regex = string;
  let options = '';
  
	if (parts.length > 1) {
		regex = parts[1];
		options = parts[2];
	} else {
		return undefined
  }
	try {
		return new RegExp(regex, options);
	} catch (e) {
		return undefined
	}
};

const toBoolean = string => {
  if (string === 'false') return false;
  if (string === 'true') return true;
  if (string === 'null') return null;
	return undefined
}

const toQueryObject = string => {
	const regex = /\{\s*(\$.[^:]*):\s*(.*[^\s])\s*\}/;
	const group = string.match(regex)
	if (group){
		return {[group[1]]: parseQueryValue(group[2])}
	}
	return undefined
}

const toGeoQuery = string => {
	const regex = /\{\s*(\$geoIntersects):\s*(\[.*\])\s*\}/;

}

const toDate = string => {
	if (!isNaN(Date.parse(string))) {
		return new Date(string)
	}
	return undefined
}

const hasParsed = parsed => typeof parsed !== 'undefined';

const parseQueryValue = value => {
  let parsed = toBoolean(value); if (hasParsed(parsed)) return parsed;
  parsed = toNumeric(value); if (hasParsed(parsed)) return parsed;
  parsed = toRegex(value); if (hasParsed(parsed)) return parsed;
	parsed = toQueryObject(value); if (hasParsed(parsed)) return parsed;
	parsed = toDate(value); if (hasParsed(parsed)) return parsed;
  return value
}

const parseQuery = (query = {}) => (
	Object.entries(query).reduce((acc, [key, value]) => {
    if (Array.isArray(value)){
      return {
        ...acc,
        $and: value.map(v => ({
          [key]: parseQueryValue(v)
        }))
      }
    }
    return {
      ...acc, [key]: parseQueryValue(value)
    }
  }, {})
)

module.exports = parseQuery
