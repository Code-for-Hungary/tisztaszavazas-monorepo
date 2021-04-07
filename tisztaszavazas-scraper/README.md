# Tisztaszavazas scraper

You can use this tool to scrape valasztas.hu

## Installation

```
clone
yarn
```

Clone `.env.example` to `.env` and fill it.

## Usage

### Initialze a scraping

Create and export new model in 
`./schemas/SzavazokorUrl`, 
`./schemas/Szavazokor`,
`./schemas/KozigEgyseg` and 
`./schemas/Valasztokerulet`. Export the models in `./schemas/index`

Fill the `./urlGenerators/index` "tables" with the proper url segments and add the column index to the `getParamColIndex` function.

Create the appropriate loops in `./scripts/crawlSzkUrls` which match the election.

Crawl the ballot office urls and save to DB. Start manually the following (change onk2019 and v1)

`$ yarn crawlSzkUrls onk2019 v1`


### Start server

Start the REST server
```
yarn start
```

you can reach the core url data on `GET /szavkorurls`


### Initialze szavazokorok

`yarn initSzk onk2019 vx` command initialzes the szavazokor db.

add onk2019_vx to DEFAULT_DB in .env


### Start scraping

Send the following request body to

`POST` `/processes`

(filled with default values, no required param)

```json
{
		"electionDb": "onk2019_v2",
		"doFetchHtml": true,
		"doGetGeoData": true,
		"doSaveHtmlToFile": false,
		"doParseSzkDetails": true,
		"doUpdateDb": true,
		"query": {},  // e.g. { "query": { "akadalymentes": { "$exists": false } } }
		"timeoutSec": 7,
		"szavazokorId": null
}
```



you can start scraping a process by sending

`POST`
```json
{
	"szavazokorId": "5e77c3f08723e7a7b25c4649", // id of an szk
	// or
	"query": {},	// query with result of multiple szk

	"doUpdateDb": true,
	
	// optional params with default
	"valasztasAzonosito": "onk2019_v1",
	"doFetchHtml": true,
	"doGetGeoData": true,
	"doParseSzkDetails": true,
	"timeoutSec": 2, 
}
```

## Valasztokeruletek

- Get the polygons of OEVKS from the main page of the parlamentary election.
- Clean it and make valid JSON with an array in the root
- Fill valasztokeruletek collection. You can complete the script of `addOevkGeometry` with leiras and szam resolver function

### Finalisation

Copy-paste the schemas folder into tisztaszavazas-api
