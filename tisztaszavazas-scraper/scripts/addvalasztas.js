const { model, Types } = require('mongoose');
const connectDb = require('../functions/connectDb')
const SzavazokorSchema = require('../schemas/Szavazokor')


;(async() => {
  await connectDb()
  Szavazokors = model('idbo620_v1_szavazokors', SzavazokorSchema)
  const r = await Szavazokors.updateMany({}, {
    valasztas: {
      kod: 'idobo620',
      leiras: "Borsodi időközi országgyűlési választás 2020",
      tipus: "Időközi országgyűlési választás"
    }
  })

  console.log(r)
})()