const express = require('express')
const parseQuery = require('../functions/parseQuery')
const authorization = require('../middlewares/authorization')
const Models = require('../schemas')
const getPrevNextLinks = require('../functions/getPrevNextLinks')
const parseStringObject = require('../functions/parseStringObject')

/**
* @api {get} /szavazatok/ 1.) Az összes eredmény
* @apiName szavazatok
* @apiGroup 4. Szavazatok
* @apiDescription A jelöltekre leadott szavazatok listája
*
* @apiParam (Request Parameters) {Number} [limit] Csak a megadott számú találatot adja vissza (default: `20`)
* @apiParam (Request Parameters) {Number} [skip] A lapozáshoz használható paraméter. (default: `0`)
* @apiParam (Request Parameters) {Number|String|Regex|Query} [queryParameters] A rekordok bármely paramétere alapján lehet szűkíteni a listát.
* @apiHeader (Request Headers) Authorization A regisztrációkor kapott kulcs
* @apiHeader (Request Headers) [X-Valasztas-Kodja] A választási adatbázis kiválasztása (Lehetsésges értékek: 2018-as országgyűlési: `ogy2018`)
* @apiHeader (Response Headers) X-Total-Count A szűrési feltételeknek megfelelő, a válaszban lévő összes elem a lapozási beállításoktől függetlenül
* @apiHeader (Response Headers) X-Prev-Page A `limit` és `skip` paraméterekkel meghatározott lapozás következő oldala
* @apiHeader (Response Headers) X-Next-Page A `limit` és `skip` paraméterekkel meghatározott lapozás előző oldala
*
* @apiSuccessExample {json} Success-Response:
*  HTTP/1.1 200 OK
*  [
*    { 
*      "_id": "5eee424dac32540023500d13",
*      "leiras": "Budapest 1. számú OEVK",
*      "szam": 1,
*      "korzethatar": {
*        "type": "Polygon",
*        "coordinates": [
*           [
*             [
*               19.066171646118164,
*               47.47514343261719
*             ],
*             [
*               19.074604034423828,
*               47.477970123291016
*             ],
* 	  	      ...
*           ]
*         ]
*       }
*     }
*   ]
* @apiSampleRequest off
*/

const router = express.Router();

const DEFAULT_LIMIT = 20;

router.all('*', authorization)
let Szavazats, db;

router.all('*', (req, res, next) => { 
  db = req.headers['x-valasztas-kodja'] || process.env.DEFAULT_DB
  const [valasztasAzonosito, version = 'latest'] = db.split('_')
  Szavazats = Models.Szavazat[valasztasAzonosito][version]
  if (!Szavazats){
    res.status(400)
    res.json({'error': `Hibás választás kód: '${db}'` })
    return
  }
  next()
})

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
      result = await Szavazats.findById(id)
      totalCount = 1
    } else if (body && body.query){
      try {
        const aggregations = parseStringObject(body.query)
        result = await Szavazats.aggregate(aggregations)
      } catch(error){
        result = error.message
      }
    } else {
      let aggregations = [
        { $match: query },
        { $skip: skip },
        { $limit: limit },
      ]

      ;([{ result, totalCount }] = await Szavazats.aggregate([{
        $facet: {
          result: aggregations,
          totalCount: [{ $match: query },{ $count: 'totalCount' }] }
      }]))

      totalCount = totalCount && totalCount[0] && totalCount[0].totalCount   
    }

    const prevNextLinks = getPrevNextLinks({
      route: 'eredmenyek',
      skip,
      limit,
      query,
      totalCount
    })

    res.header({...prevNextLinks})
    res.header('X-Total-Count', totalCount)  
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(404);
    res.json('Szavazatok not found')
  }
});

module.exports = router;
