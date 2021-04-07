const getQueryString = query => Object.entries(query).reduce((acc, [key, value], i) => (
	`${acc}${i ? '&' : ''}${key}=${encodeURIComponent(value)}`
), '?')

module.exports = ({ route, skip, limit, query, totalCount }) => {
	if (skip%limit !== 0) return null;
	if (!totalCount) return null;

	const prevNextLinks = {}

	if (skip >= limit) {
		const skipPrev = skip - limit
		const prevPageLink = `/${route}${getQueryString({ ...query, skip: skipPrev, limit })}`
		prevNextLinks['X-Prev-Page'] = prevPageLink
	}

	if (skip + limit < totalCount) {
		const skipNext = skip + limit
		const nextPageLink = `/${route}${getQueryString({ ...query, skip: skipNext, limit })}`
		prevNextLinks['X-Next-Page'] = nextPageLink
	}

	return prevNextLinks
}