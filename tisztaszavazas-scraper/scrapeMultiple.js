import Process from "./schemas/Process";
import scraper from "./scraper";
import sleep from "./functions/sleep";
import randomInt from './functions/randomInt';
import Schemas from './schemas';
import parseQuery from "./functions/parseQuery";
import getCountryName from './functions/getCountryData';
import dotenv from 'dotenv'

dotenv.config()

const getSzavazokorokByIdOrQuery = async ({ szavazokorId, query = {}, Szavazokors }) => {
  if (szavazokorId) {
    return [ await Szavazokors.findById(szavazokorId) ];
  }

  return await Szavazokors.find(query)
}

export default async ({
  szavazokorId,
  query = {},
  timeoutSec = 3,
  electionDb = process.env.DEFAULT_DB,
  processId
}) => {
  const [valasztasAzonosito, version] = electionDb.split('_');
  const Szavazokors = Schemas.Szavazokor[valasztasAzonosito][version]
  const KozigEgysegs = Schemas.KozigEgyseg[valasztasAzonosito][version]
  const Valasztokerulets = Schemas.Valasztokerulet[valasztasAzonosito][version]

  if (!Szavazokors){
    throw new Error('Szavazokor valasztasAzonosito hiba')
  }

  const szavazokorok = await getSzavazokorokByIdOrQuery({ szavazokorId, query, Szavazokors })

  console.log(szavazokorok.length, 'szavazokors queried')

  let i = 0;
  for (let szavazokor of szavazokorok) {
    try {
      const {
        isRunning,
        doFetchHtml,
        doSaveHtmlToFile,
        doGetGeoData,
        doParseSzkDetails,
        doUpdateDb		
      } = await Process.findById(processId);
      if (!isRunning) {
        const message = 'process stopped by the user'
        await Process.findByIdAndUpdate(processId, {
          $push: { messages: message }
        })
        console.log(message)
        break;
      }

      const sleepTime = randomInt (timeoutSec * 1000, timeoutSec && (timeoutSec * 1000 + 4))
      console.log(`waiting ${sleepTime/1000} sec...`)
      await sleep(sleepTime)
      console.log(i++, szavazokor['_id'], 'in progress...')
      const progressStateMessage = ["", `${i} / ${szavazokorok.length}`]

      let scrapingMessages, center, paths, szkParsedData

      try {
        ;({
          messages: scrapingMessages,
          center,
          paths,
          szkParsedData
        } = await scraper(szavazokor, {
          doFetchHtml,
          doSaveHtmlToFile,
          doGetGeoData,
          doParseSzkDetails,
        }))
      } catch(error){
        console.log(error)
        throw new Error(`Parser error, ${scrapingMessages.join()}`)
      }

      const dbUpdateMessages = [];

      if (doUpdateDb) {
        let {
          frissitveValasztasHun,
          szavkorDetails: {
            akadalymentes,
            kozigEgyseg: {
              kozigEgysegNeve
            },
            szavazokorCime,
            valasztokSzama,
            valasztokerulet: {
              leiras,
              szam
            }
          },
          utcalista: {
            kozteruletek
          }
        } = szkParsedData


        try {

          const options = { upsert: true, new: true, setDefaultsOnInsert: true };
          
          const {
            kozigEgyseg: {
              megyeKod,
              telepulesKod
            }
          } = szavazokor
          const kozigData = {
            kozigEgysegNeve,
            megyeKod,
            telepulesKod,
            megyeNeve: getCountryName(megyeKod)
          }
          const kozigEgyseg = await KozigEgysegs.findOneAndUpdate(
            kozigData,
            kozigData,
            options
          )
          kozigData.kozigEgysegRef = kozigEgyseg

          const valasztokeruletData = {
            leiras,
            szam
          }

          const valasztokerulet = await Valasztokerulets.findOneAndUpdate(
            valasztokeruletData,
            valasztokeruletData,
            options
          )

          valasztokeruletData.valasztokeruletRef = valasztokerulet

          const response = await Szavazokors.findByIdAndUpdate(
            szavazokor['_id'],
            {
              $set: {
                korzethatar: {
                  type: 'Polygon',
                  coordinates: [paths]
                },
                szavazohelyisegHelye: {
                  type: 'Point',
                  coordinates: center
                },
                frissitveValasztasHun,
                akadalymentes,
                kozigEgyseg,
                szavazokorCime,
                valasztokSzama,
                valasztokerulet,
                kozteruletek
              }
            }
          )

          if (!response) dbUpdateMessages.push('!! Cannot find szk. db not updated')
          else dbUpdateMessages.push('Db updatet successfully')
        } catch(error){
          console.log(error.message || error)
          dbUpdateMessages.push('!! Db update error')
          dbUpdateMessages.push(JSON.stringify(error))
          dbUpdateMessages.push(error.message)
        }
      }

      await Process.findByIdAndUpdate(processId, {
        $push: { messages: [
          ...progressStateMessage,
          ...scrapingMessages, 
          ...dbUpdateMessages
        ].join(' ') }
      })
    } catch(error){
      console.log(error.message)
      await Process.findByIdAndUpdate(processId, {
        $push: { messages: `${szavazokor['_id']} scrape error` }
      })      
    }
  }

  const doneMessage = `${i} scraped`

  await Process.findByIdAndUpdate(processId,
    {
      $set: {
        'isRunning': false					
      },
      $push: { messages: doneMessage }      
    }
  )

  console.log(doneMessage)
}