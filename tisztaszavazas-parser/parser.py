# https://vimeo.com/147784643
#!/usr/bin/python3

import sys
from flask import Flask, jsonify, request
from bs4 import BeautifulSoup
from getUtcaLista import getUtcaLista
from getSzavkorDetails import getSzavkorDetails
from getRefreshDate import getRefreshDate
from getSzkList import getSzkList

app = Flask(__name__)

@app.route('/szk-parse', methods=['POST'])

def parser():
	# try:
	html = request.data
	soup = BeautifulSoup(html, "html.parser")

	response = {
		"utcalista": getUtcaLista(soup),
		"szavkorDetails": getSzavkorDetails(soup),
		"frissitveValasztasHun": getRefreshDate(soup)
	}

	return response
	# except:
	# 	return({ "error": "Error occured" })

@app.route('/szk-list-page-parse', methods=['POST'])

def parseSzkListPage():
	try:
		html = request.data
		soup = BeautifulSoup(html, "html.parser")

		return jsonify(getSzkList(soup))
	except:
		return({ "error": "Error occured" })

