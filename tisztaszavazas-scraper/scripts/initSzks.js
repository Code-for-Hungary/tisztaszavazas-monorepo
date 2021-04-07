import dotenv from 'dotenv'
import schemas from '../schemas';
import { getPolygonUrl, getSzavazokorUrl, getPreIdByContext } from '../urlGenerators';
import connectDb from '../functions/connectDb';
import getDbFromArgs from './getDbFromArgs';

dotenv.config()

const { version, valasztasAzonosito } = getDbFromArgs()

const Szavazokors = schemas.Szavazokor[valasztasAzonosito][version]
const SzavazokorUrls = schemas.SzavazokorUrl[valasztasAzonosito][version]

;(async valasztasAzonosito => {
  await connectDb()

  const preId = getPreIdByContext({
    valasztasAzonosito,
    context: 'szavazokorUrl'
  })
  console.log({ preId })

  const urlEntries = await SzavazokorUrls.find();
  console.log(`${urlEntries.length} urls found in db`)

  const toInsert = urlEntries.map(({ query }) => {
    const telepulesKod = +query[`_${preId}_telepulesKod`]
    const megyeKod = +query[`_${preId}_megyeKod`]
    const szavazokorSzama = +query[`_${preId}_szavkorSorszam`]

    const polygonUrl = getPolygonUrl({
      szavkorSorszam: szavazokorSzama,
      megyeKod,
      telepulesKod,
      valasztasAzonosito
    })

    const vhuUrl = getSzavazokorUrl({
      megyeKod,
      telepulesKod,
      szavkorSorszam: szavazokorSzama,
      valasztasAzonosito
    })

    return {
      szavazokorSzama,
      kozigEgyseg: {
        megyeKod,
        telepulesKod
      },
      vhuUrl,
      polygonUrl,
      valasztasAzonosito
    }
  })

  const response = await Szavazokors.insertMany(toInsert)
  console.log(response.length, 'inserted')

})(valasztasAzonosito)