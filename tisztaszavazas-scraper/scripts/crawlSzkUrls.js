import axios from "axios";
import dotenv from 'dotenv'
import url from 'url'
import Schemas from '../schemas'
import sleep from '../functions/sleep'
import { getSzavazokorListUrl } from "../urlGenerators";
import connectDb from "../functions/connectDb";
import getCountryData from "../functions/getCountryData";
import countryData from "../constants/countryData";
import getDbFromArgs from "./getDbFromArgs";

dotenv.config()

const parseSzkListPage = async html => {
  const { data } = await axios({
    method: 'POST',
    url: `${process.env.PARSER_URL}/szk-list-page-parse`,
    data: html,
    headers: { 'Content-Type': 'text/html' }
  })
  return data;
}

const getUrlsOnPage = async szkListPageUrl => {
  const { data: html } = await axios.get(szkListPageUrl);
  const parsedSzkListPage = await parseSzkListPage(html)
  const urlsOnPage = parsedSzkListPage.map(({ szkUrl }) => ({
    url: szkUrl,
    query: szkUrl && url.parse(szkUrl, true)['query']
  }))
  .filter(({ url }) => url)  
  return urlsOnPage
}

const { version, valasztasAzonosito } = getDbFromArgs()

const maxMegyekod = countryData.length;

const Schema = Schemas.SzavazokorUrl[valasztasAzonosito][version]

;(async valasztasAzonosito => {

  await connectDb()

  if (['onk2019'].includes(valasztasAzonosito)) {
    for (let megyeKod = 1; megyeKod <= maxMegyekod; megyeKod+=1 ) {
      for (let page = 1; page < 9999; page+=1) {

        const szkListPageUrl = getSzavazokorListUrl({ page, megyeKod, valasztasAzonosito })

        await sleep(500)
        console.log('------', { megyeKod, page })
        try {
          await sleep(1000)
          console.log({ szkListPageUrl })

          const urlsOnPage = await getUrlsOnPage(szkListPageUrl)

          console.log({urlsOnPage})

          const response = await Schema.insertMany(urlsOnPage)
          // console.log(response)
        } catch(error){
          console.log(error.message)
          console.log('done, error')
          break;			
        }
      }
    }
  }

  if (valasztasAzonosito === 'ogy2018') {
    for (let megyeKod = 1; megyeKod <= maxMegyekod; megyeKod+=1 ) {
      const maxOevk = getCountryData(megyeKod, 'nrOfOevk')
      for (let oevkKod = 1; oevkKod <= maxOevk; oevkKod += 1) {
        for (let page = 1; page < 9999; page+=1) {

          const szkListPageUrl = getSzavazokorListUrl({ page, megyeKod, oevkKod, valasztasAzonosito })

          await sleep(500)
          console.log('------', { megyeKod, oevkKod, page })
          try {
            await sleep(1500)
            console.log({ szkListPageUrl })

            const urlsOnPage = await getUrlsOnPage(szkListPageUrl)

            console.log({urlsOnPage})

            const response = await Schema.insertMany(urlsOnPage)
            // console.log(response)
          } catch(error){
            console.log(error.message)
            console.log('done, error')
            break;			
          }
        }
      }
    }
  }

  if (valasztasAzonosito === 'idbo620') {
    const megyeKod = '05'

    for (let page = 1; page < 9999; page+=1) {
      const szkListPageUrl = getSzavazokorListUrl({ page, megyeKod, valasztasAzonosito })

      await sleep(500)
      console.log('------', { megyeKod, page })
      try {
        await sleep(1500)
        console.log({ szkListPageUrl })

        const urlsOnPage = await getUrlsOnPage(szkListPageUrl)

        console.log({urlsOnPage})

        const response = await Schema.insertMany(urlsOnPage)
        // console.log(response)
      } catch(error){
        console.log(error.message)
        console.log('done, error')
        break;			
      }
    }
  }

})(valasztasAzonosito)

/* */