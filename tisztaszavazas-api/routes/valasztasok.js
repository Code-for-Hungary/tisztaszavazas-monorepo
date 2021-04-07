const express = require('express')
const parseQuery = require('../functions/parseQuery');
const parseStringObject = require('../functions/parseStringObject');
const authorization = require('../middlewares/authorization')
const Models = require('../schemas')

/**
* @api {get} /valasztasok/ 1.) Az összes választás
* @apiName valasztasok
* @apiGroup 5. Választások
* @apiDescription Az adatbázisban feldolgozott választások
*
* @apiParam (Request Parameters) {Number} [limit] Csak a megadott számú találatot adja vissza (default: `20`)
* @apiParam (Request Parameters) {Number} [skip] A lapozáshoz használható paraméter. (default: `0`)
* @apiParam (Request Parameters) {Number|String|Regex|Query} [queryParameters] A rekordok bármely paramétere alapján lehet szűkíteni a listát.
* @apiHeader (Request Headers) Authorization A regisztrációkor kapott kulcs
* @apiHeader (Response Headers) X-Total-Count A szűrési feltételeknek megfelelő, a válaszban lévő összes elem a lapozási beállításoktől függetlenül
*
* @apiSuccessExample {json} Success-Response:
*  HTTP/1.1 200 OK
*  [
*    { 
*      "_id": "600471eda6932f5deae8f45b",
*      "kod": "ogy2018",
*      "leiras": "Országgyűlési képviselők választása 2018",
*      "tipus": "Általános országgyűlési választás"
*     },
*    { 
*      "_id": "600471eda6932f5deae8f45c",
*      "kod": "onk2019",
*      "leiras": "Helyi önkormányzati választások 2019",
*      "tipus": "Általános országgyűlési választás"
*     },
*     ...
*   ]
* @apiSampleRequest off
*/

const router = express.Router();

const DEFAULT_LIMIT = 20;

router.all('*', authorization)
let Valasztas = Models.Valasztas

router.all('/:id?', async (req, res) => {
  try {
    let {
      params: { id },
      query,
      body,
    } = req;

    let limit, skip, result, totalCount
    query = parseQuery(query)

    ;({
      limit = DEFAULT_LIMIT,
      skip = 0,
      ...query
    } = query)

    if (id) {
      result = await Valasztas.findById(id)
      totalCount = 1
    } else if (body && body.query){
      try {
        const aggregations = parseStringObject(body.query)
        result = await Valasztas.aggregate(aggregations)
      } catch(error){
        result = error.message
      }
    } else {
      let aggregations = [
        { $match: query },
        { $skip: skip },
        { $limit: limit },
      ]

      ;([{ result, totalCount }] = await Valasztas.aggregate([{
        $facet: {
          result: aggregations,
          totalCount: [{ $match: query },{ $count: 'totalCount' }] }
      }]))

      totalCount = totalCount && totalCount[0] && totalCount[0].totalCount   
    }

    res.header('X-Total-Count', totalCount)
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(404);
    res.json('Valasztas not found')
  }
});

module.exports = router;
