const express = require('express')
const Schema = require('../schemas/Usage')
const authorization = require('../middlewares/authorization')
const getSortObject = require('../functions/getSortObject')
const parseQuery = require('../functions/parseQuery')
const getPrevNextLinks = require('../functions/getPrevNextLinks')


/**
 * @api {get} /usage/ 1.) A felhasználó szerver-eléréseinek időbélyegei és IP-i.
 * @apiName usage
 * @apiGroup 4. Usage
 * @apiDescription  Az API más adatot nem tárol a lekérésekről, úgy mint a lekérés vagy a válasz tartalmát stb. Csupán a túlhasználat elkerülése érdekében naplózza az egyes felhasználók által indított kérések időbélyegét és IP címét.
 *
 * @apiParam (Request Parameters) {Number} [limit] Csak a megadott számú találatot adja vissza (default: `20`)
 * @apiParam (Request Parameters) {Number} [skip] A lapozáshoz használható paraméter. (default: `0`)
 * @apiHeader (Request Headers) Authorization A regisztrációkor kapott kulcs
 * @apiHeader (Response Headers) X-Prev-Page A `limit` és `skip` paraméterekkel meghatározott lapozás következő oldala
 * @apiHeader (Response Headers) X-Next-Page A `limit` és `skip` paraméterekkel meghatározott lapozás előző oldala
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *    {
 *       "_id": "5e9b4f3ecfc988ec3350685a",
 *       "name": "Your Name",
 *       "__v": 0,
 *       "createdAt": "2020-04-18T19:04:30.001Z",
 *       "updatedAt": "2020-04-18T19:04:30.001Z"
 *   },
 *   {
 *       "_id": "5e9b50eaf7bd64fefb24bc60",
 *       "name": "Your Name",
 *       "ip": "::1",
 *       "__v": 0,
 *       "createdAt": "2020-04-18T19:11:38.935Z",
 *       "updatedAt": "2020-04-18T19:11:38.936Z"
 *   }
 * ...
 * ]
 * @apiSampleRequest off
 */

const DEFAULT_LIMIT = 20;


const router = express.Router()

router.all('*', authorization)

let limit, sort, skip, totalCount, result;

router.get('/', async (req, res) => {
	let {
		query
	} = req;

	query = parseQuery(query)
	
	;({ limit = DEFAULT_LIMIT, skip = 0, sort, ...query } = query)
	
	const { name } = req.user;

	const queryWithName = { ...query, name }

	sort = getSortObject(sort)

	const aggregations = [
		{ $match: queryWithName },
		{ $skip: skip },
		{ $limit: limit }
	]

	;([{ result, totalCount }] = await Schema.aggregate([{
		$facet: {
			result: aggregations,
			totalCount: [{ $match: query },{ $count: 'totalCount' }] }
	}]))

	totalCount = totalCount && totalCount[0] && totalCount[0].totalCount

	const prevNextLinks = getPrevNextLinks({
		route: 'usage',
		skip,
		limit,
		query,
		totalCount
	})

	res.header({...prevNextLinks})
	res.header('X-Total-Count', totalCount)
	res.json(result)
})


module.exports = router;