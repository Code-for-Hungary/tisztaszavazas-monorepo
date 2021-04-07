from bs4 import BeautifulSoup
import sys
import json


from getUtcaLista import getUtcaLista
from getSzavkorDetails import getSzavkorDetails
from getRefreshDate import getRefreshDate
from getSzkList import getSzkList

scripts = {
	"getUtcaLista": getUtcaLista,
	"getSzavkorDetails": getSzavkorDetails,
	"getRefreshDate": getRefreshDate,
	"getSzkList": getSzkList
} 

def main(script_name, htmlFileName, table_row):

	html = open(htmlFileName, 'r', encoding='utf-8')
	try:
		soup = BeautifulSoup(html, "html.parser")
		print(json.dumps(scripts[script_name](soup)['kozteruletek'][table_row], indent=4)),
	except:
		print('Error occured')

# if len(sys.argv)>1:
# 	script_name = sys.argv[1]
# 	htmlFileName = sys.argv[2]
# 	table_row = int(sys.argv[3]
# 	main(script_name, htmlFileName, table_row)
