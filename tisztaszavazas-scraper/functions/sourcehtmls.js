import express from 'express';
import Schema from '../schemas/SourceHtml';
import parseQuery from '../functions/parseQuery';
import authorization from '../middlewares/authorization';
import getSortObject from '../functions/getSortObject';
import getPrevNextLinks from '../functions/getPrevNextLinks';

const DEFAULT_LIMIT = 20;
const DEFAULT_SORT = 'kozigEgyseg.megyeKod,kozigEgyseg.telepulesKod'

const projection = { html: 0 }

const router = express.Router()

router.all('*', authorization)
router.all('*', (req, res, next) => {
  if (!req.user.roles || !req.user.roles.includes('admin')) {
    res.status(404)
    res.json('Not found')
    return
  }
  next()
})

router.get('/:id?', async (req, res) => {
  let {
    params: { id },
    query
  } = req;

  let limit, sort, skip, totalCount, result;

  query = parseQuery(query)

  ;({ limit = DEFAULT_LIMIT, skip = 0, sort = DEFAULT_SORT, ...query } = query)

  sort = getSortObject(sort)

  try {
    if (id) {
      result = await Schema.findById(id)
    } else {
      
      let aggregations = [
        { $match: query },
        { $project: projection },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ];      

      ;([{ result, totalCount }] = await Schema.aggregate([{
        $facet: {
          result: aggregations,
          totalCount: [{ $match: query },{ $count: 'totalCount' }] }
      }]))

      totalCount = totalCount && totalCount[0] && totalCount[0].totalCount

    }

    const prevNextLinks = getPrevNextLinks({
      route: 'sourcehtmls',
      skip,
      limit,
      query,
      totalCount
    })

    res.header({...prevNextLinks})
    res.header('X-Total-Count', totalCount)

    res.status(result ? 200 : 400)
    res.json(result || 'SourceHtml not found')
  } catch(error) {
    console.log(error)
    res.json({ error: error.message })
  }
})

export default router;