import express from 'express';
import Schema from '../schemas/Process'
import crawl from '../scrapeMultiple'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

let limit, sort, skip, totalCount, result;

router.all('*', (req, res, next) => { 
  if (req.headers.authorization!==process.env.ADMIN_TOKEN){
    res.status(401)
    return res.json('Auth error')
  }
  next()
})

router.get('/:id?', async (req, res) => {
  let {
    params: {
      id
    },
    query,
  } = req;

  if (id){
    result = await Schema.findById(id)
  } else {
    ;({ limit = 20, skip = 0, sort = { updatedAt: -1 }, ...query } = query)
    
    const projection = { messages: 0 }

    const aggregations = [
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      { $project: projection }
    ]

    ;([{ result, totalCount }] = await Schema.aggregate([{
      $facet: {
        result: aggregations,
        totalCount: [{ $match: query },{ $count: 'totalCount' }] }
    }]))

    totalCount = totalCount && totalCount[0] && totalCount[0].totalCount

    res.header('X-Total-Count', totalCount)
  }

  res.json(result)
})

router.post('/', async (req, res) => {
  let {
    query,
    body: {
      electionDb = process.env.DEFAULT_DB,
      doFetchHtml = true,
      doSaveHtmlToFile = false,
      doGetGeoData = true,
      doParseSzkDetails = true,
      doUpdateDb = true,
      query: bodyQuery,
      timeoutSec,
      szavazokorId,
    }
  } = req

  query = bodyQuery || query

  try {
    let response = await Schema.insertMany([{
      isRunning: true,
      doFetchHtml,
      doSaveHtmlToFile,
      doGetGeoData,
      doParseSzkDetails,
      doUpdateDb,
      query: JSON.stringify(query),
      szavazokorId,
      electionDb,
      timeoutSec,
      messages: ['Process started']
    }])

    const { 0: { _id: processId } } = response;
    
    crawl({
      electionDb,
      query,
      szavazokorId,
      processId,
      timeoutSec
    })

    response = {
      statusMessage: `Crawling process started with id '${processId}'`,
      statusUrl: `/processes/${processId}`,
      ...response
    }

    res.json(response)
  } catch(error){
    console.log(error)
    res.status(500)
    res.json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  let {
    params: {
      id
    },
    body
  } = req;

  try {
    const response = await Schema.findByIdAndUpdate(id, body);
    res.json(response)
  } catch(error){
    console.log(error)
    res.status(500)
    res.json({ error: error.message })
  }
})



export default router;