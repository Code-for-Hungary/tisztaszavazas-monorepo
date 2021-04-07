#!/usr/bin/python3
import re

def getSzavkorDetails(soup):

	groupDiv = soup.findAll("div", {"class": "szavazokorieredmenyek-details-container"})[0]

	# szavazokorCime
	szavazokorCime = groupDiv \
	.findAll("div", {"class": "row-fluid"})[0] \
	.findAll("div", {"class": "row-fluid"})[0] \
	.findAll("span", {"class": "text-semibold"})[0] \
	.getText()

	# telepulesNev
	telepulesNev = groupDiv \
	.findAll("div", {"class": "span6"})[1] \
	.findAll("div", {"class": "span6"})[1] \
	.getText()
		
	regex = r"^(.[^\d]+)\d{1,3}. szavazókör"
	telepulesNevMatches = re.match(regex, telepulesNev)

	# valasztokerulet
	valasztokerulet = groupDiv \
	.findAll("div", {"class": "span6"})[4] \
	.findAll("span", {"class": "text-semibold"})[0] \
	.getText()

	if valasztokerulet.strip() == '-':
		valasztokerulet_dict = {
			"valasztokerulet": {
				"leiras": "-",
				"szam": None
			}
		}
	else:
		regex = r"^.[^\d]+(\d{1,3})."
		valasztokeruletMatches = re.match(regex, valasztokerulet)

		valasztokerulet_dict =	{
			"valasztokerulet": {
				"leiras": valasztokerulet.strip(),
				"szam": int(valasztokeruletMatches.group(1))	
			}
		}

	# valasztokSzama
	valasztokSzama = groupDiv \
	.findAll("div", {"class": "span6"})[5] \
	.findAll("span", {"class": "text-semibold"})[0] \
	.getText()

	regex = r"^\s?(.+) f.+"
	valasztokSzamaMatches = re.match(regex, valasztokSzama)

	# akadalymentes
	akadalymentes = groupDiv \
	.select("div[class*=akadalymentes]")


	return {
		"szavazokorCime": szavazokorCime.strip(),
		"kozigEgyseg": {
			"kozigEgysegNeve": telepulesNevMatches.group(1).strip()
		},
		**valasztokerulet_dict,
		"valasztokSzama": int(valasztokSzamaMatches.group(1)),
		"akadalymentes": bool(len(akadalymentes))
	}
	