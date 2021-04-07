#!/usr/bin/python3
import pytz, datetime
import re

def getRefreshDate(soup):
	
	refreshDateWrap = soup.findAll("div", {"class": "portlet-body"})[1] \
	 .findAll("div", {"class": "row-fluid"})[0] \
	 .findAll("div", {"class": "span6"})

	if len(refreshDateWrap) > 1:
		refreshDate = refreshDateWrap[1] \
		.findAll("span", {"class": "text-semibold"})[0] \
		.getText()
	else:
		return None

	regex = r"^(\d{4}).\s(.[^\s]+)\s(\d{1,2}).,\s(.+)"
	refreshDateMatches = re.match(regex, refreshDate.strip())

	year = refreshDateMatches.group(1)
	month = ["január", "február", "március", "április", "május", "június", "július",
	"augusztus", "szeptember", "október", "november", "december"] \
	.index(refreshDateMatches.group(2)) + 1
	day = refreshDateMatches.group(3)
	time = refreshDateMatches.group(4)

	date_str = year + '-' + \
	str(month) + "-" + \
	day + " " + \
	time

	local = pytz.timezone ("Europe/Budapest")
	naive = datetime.datetime.strptime (date_str, "%Y-%m-%d %H:%M:%S")
	local_dt = local.localize(naive, is_dst=None)
	utc_dt = local_dt.astimezone(pytz.utc)

	return utc_dt