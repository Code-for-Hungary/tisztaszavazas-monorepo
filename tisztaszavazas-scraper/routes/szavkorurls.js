import express from 'express';
import Schema from '../schemas/SzavazokorUrl';

const DEFAULT_LIMIT = 20;

const router = express.Router()

router.get('/:id?', async (req, res) => {
  let {
    params: { id },
    query: { limit = DEFAULT_LIMIT, ...query }
  } = req;


  try {
    let result;
    if (id) {
      result = await Schema.findById(id)
    } else {
      result = await Schema.find(query).limit(limit)
    }

    res.status(result.length ? 200 : 404)
    res.json(result || 'Not found')
  } catch(error) {
    console.log(error)
    res.json({ error: error.message })
  }
})

router.post('/:id?', async (req, res) => {
  try {
    const {
      body
    } = req

    const response = await Schema.insertMany(body)
    res.json(response)
  } catch(error){
    console.log(error)
    res.status(500)
    res.json({ error: error.message})
  }
})

export default router;