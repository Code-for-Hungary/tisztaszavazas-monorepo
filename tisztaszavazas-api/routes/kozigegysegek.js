const { Types } = require('mongoose')
const express = require('express')
const parseQuery = require('../functions/parseQuery')
const authorization = require('../middlewares/authorization')
const Models = require('../schemas')
const getPrevNextLinks = require('../functions/getPrevNextLinks')
const parseStringObject = require('../functions/parseStringObject')


/**
* @api {get} /kozigegysegek/ 1.) Összes közigazgatási egység
* @apiName kozigegysegek2
* @apiGroup 1. Közigegységek
*
* @apiParam (Request Parameters) {Number} [limit] Csak a megadott számú találatot adja vissza (default: `20`)
* @apiParam (Request Parameters) {Number} [skip] A lapozáshoz használható paraméter. (default: `0`)
* @apiHeader (Request Headers) Authorization A regisztrációkor kapott kulcs
* @apiHeader (Request Headers) [X-Valasztas-Kodja] A választási adatbázis kiválasztása. (Lehetsésges értékek: 2019-es önkormányzati: `onk2019`, 2018-as országgyűlési: `ogy2018`, 2020-as borsodi időközi: `idbo620`)
* @apiHeader (Response Headers) X-Total-Count A szűrési feltételeknek megfelelő, a válaszban lévő összes elem a lapozási beállításoktől függetlenül
* @apiHeader (Response Headers) X-Prev-Page A `limit` és `skip` paraméterekkel meghatározott lapozás következő oldala
* @apiHeader (Response Headers) X-Next-Page A `limit` és `skip` paraméterekkel meghatározott lapozás előző oldala
*
* @apiSuccessExample {json} Success-Response:
*  HTTP/1.1 200 OK
*  [
*    {
*      "_id": "006f6e6b3230313903f2",
*      "megyeNeve": "Budapest",
*      "kozigEgysegNeve": "Budapest X.ker",
*      "kozigEgysegSzavazokoreinekSzama": 76
*    },
*    {
*      "_id": "006f6e6b3230313903f3",
*      "megyeNeve": "Budapest",
*      "kozigEgysegNeve": "Budapest XI.ker",
*      "kozigEgysegSzavazokoreinekSzama": 115
*    },
* 		...
*   ]
* @apiSampleRequest off
*/

/**
 * @api {get} /kozigegysegek/:id? 2.) Egy közigazgatási egység összes adata
 * @apiName kozigegysegek3
 * @apiGroup 1. Közigegységek
 *
 * @apiParam {String} id A közigazgatási egység azonosítója az adatbázisban
 * @apiHeader (Request Headers) Authorization A regisztrációkor kapott kulcs
 * @apiHeader (Request Headers) [X-Valasztas-Kodja] A választási adatbázis kiválasztása (lásd fent)
 *  
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  
 * {
 *   "_id": "006f6e6b3230313903f2",
 *   "megyeNeve": "Budapest",
 *   "kozigEgysegNeve": "Budapest X.ker",
 *   "kozigEgysegSzavazokoreinekSzama": 76,
 *   "szavazokorok": [
 *     {
 *       "szavazokorSzama": 1,
 *       "link": "/szavazokorok/5e77c3f08723e7a7b25c47c6"
 *     },
 *     {
 *       "szavazokorSzama": 2,
 *       "link": "/szavazokorok/5e77c3f08723e7a7b25c47c7"
 *     },
 *   ...
 *     {
 *       "szavazokorSzama": 76,
 *       "link": "/szavazokorok/5e77c3f08723e7a7b25c47c9"
 *     }
 *   ],
 *   "kozteruletek": [
 *     {
 *       "kozteruletNev": "Agyagfejtő utca",
 *       "kozteruletSzavazokorei": "/szavazokorok?kozigEgyseg.kozigEgysegNeve=Budapest%20X.ker&kozteruletek.kozteruletNev=Agyagfejt%C5%91%20utca"
 *     },
 *     {
 *       "kozteruletNev": "Akna utca",
 *       "kozteruletSzavazokorei": "/szavazokorok?kozigEgyseg.kozigEgysegNeve=Budapest%20X.ker&kozteruletek.kozteruletNev=Akna%20utca"
 *     },
 *  ...
 * }
 * 
 * @apiSampleRequest off
 */

const router = express.Router();

const DEFAULT_LIMIT = 20;

const addKozteruletLinks = (kozteruletek, kozigEgysegNeve) => {
  if (kozteruletek && kozteruletek.map) {
    return kozteruletek.map(kozterulet => ({
      ...kozterulet,
      kozteruletSzavazokorei: `/szavazokorok?kozigEgyseg.kozigEgysegNeve=${encodeURIComponent(kozigEgysegNeve)}&kozteruletek.kozteruletNev=${encodeURIComponent(kozterulet.kozteruletNev)}`
    }))
  }

  return kozteruletek
}

const getProjection = ({ roles }, context) => {
  const isAdmin = roles && roles.includes('admin');

  let projection = {
    telepulesKod: 0,
    megyeKod: 0,    
  }

  switch (context) {
    case 'byId':
    case 'byQuery':
    default:
      return projection
  }
}


router.all('*', authorization)

let KozigEgysegs, Szavazokors, db;

router.all('*', (req, res, next) => { 
  db = req.headers['x-valasztas-kodja'] || process.env.DEFAULT_DB
  const [valasztasAzonosito, version] = db.split('_')
  KozigEgysegs = Models.KozigEgyseg[valasztasAzonosito][version] || Models.KozigEgyseg[valasztasAzonosito].latest
  Szavazokors = Models.Szavazokor[valasztasAzonosito][version] || Models.Szavazokor[valasztasAzonosito].latest
  if (!KozigEgysegs || !Szavazokors){
    res.status(400)
    res.json({'error': `Hibás választás kód: '${db}'` })
    return
  }
  next()
})

router.all('/:id?', async (req, res) => {
  try {
    let {
      body,
      params: { id },
      query
    } = req;

    let limit, skip, result, totalCount, projection, group;
    query = parseQuery(query)
    ;(
      {
        limit = DEFAULT_LIMIT,
        skip = 0,
        ...query
      } = query
    )

    if (id) {
      result = await KozigEgysegs.findById(id)
  
      const szkQuery = { "kozigEgyseg._id": Types.ObjectId(id) }
      group = {
        _id: null,
        kozteruletek: {
        $addToSet: {
          kozteruletNev: '$kozteruletNev'
        }
      } }
    
      const kozterulatAggregation = [
        { $match: szkQuery },
        { $unwind: "$kozteruletek" },
        { $replaceRoot: { newRoot: "$kozteruletek" } },
        { $group: group },
        { $unwind: "$kozteruletek" },
        { $group: {
          "_id": null,
          kozteruletek: { $push: '$kozteruletek' } }
        }
      ]
  
      const szavazokorAggregation = [
        { $match: szkQuery },
        { $project: { szavazokorSzama: 1, szavazokorCime: 1, _id: 1 }},
      ]
        
      const szkCountAggregation = [
        { $match: szkQuery },
        { $count: 'szkCount' },
      ]   

      let szkResult = await Szavazokors.aggregate([
        { $facet: {
          kozteruletek: kozterulatAggregation,
          szavazokorok: szavazokorAggregation,
          count: szkCountAggregation
        }},
        { $addFields: {
          kozteruletek:  { $arrayElemAt: ['$kozteruletek.kozteruletek', 0 ] },
          szavazokorok: '$szavazokorok',
          count: '$count'
        }}
      ])
   
      szkResult = szkResult[0]

      result = {
        _id: result['_id'],
        megyeNeve: result.megyeNeve,
        kozigEgysegNeve: result.kozigEgysegNeve,
        kozigEgysegSzavazokoreinekSzama: szkResult.count[0].szkCount,
        szavazokorok: szkResult.szavazokorok.map(({ _id, szavazokorSzama, szavazokorCime }) => ({
          szavazokorSzama,
          szavazokorCime,
          link: `/szavazokorok/${_id}`
        })),
        kozteruletek: addKozteruletLinks(szkResult.kozteruletek, result.kozigEgysegNeve),
      }
   
      totalCount = 1;
    } else if (body && body.query){
      try {
        const aggregations = parseStringObject(body.query)
        console.log({aggregations})
        result = await KozigEgysegs.aggregate(aggregations)
      } catch(error){
        result = error.message
      }
    } else {
      projection = getProjection(req.user, 'byQuery')
      let aggregations = [
        { $match: query },
        { $project: projection },
        { $skip: skip },
        { $limit: limit },
      ];

      ;([{ result, totalCount }] = await KozigEgysegs.aggregate([{
        $facet: {
          result: aggregations,
          totalCount: [{ $match: query },{ $count: 'totalCount' }] }
      }]))

      totalCount = totalCount && totalCount[0] && totalCount[0].totalCount   
    }

    const prevNextLinks = getPrevNextLinks({
      route: 'kozigegysegek',
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
    res.json('Kozigegyseg not found')
  }
});

module.exports = router;
