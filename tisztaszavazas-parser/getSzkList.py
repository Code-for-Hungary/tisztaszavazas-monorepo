# coding=utf-8
#!/usr/bin/python3

def getSzkList(soup):
	szkList = soup.findAll("div", {"class": "nvi-search-list"})[0] \
	.findAll("div", {"class": "nvi-custom-table"})[0] \
	.findAll("table", {"class": "table"})[0] \
	.findAll("tr", {"class": "hidden-desktop"})

	def getSzavkorUrl(tRow):
		szavkorHref = tRow.findAll("a", href=True)
		for a in szavkorHref:
			return a['href']
	
	szkUrls = []

	for item in szkList:
		szkUrl = getSzavkorUrl(item)

		szkUrls.append({
			"szkUrl": szkUrl
		})

	return szkUrls
	