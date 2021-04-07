import axios from 'axios';
import dotenv from 'dotenv'
import mapCoordinates from './functions/mapCoordinates'
import { writeFile } from 'fs'
import pad from './utils/pad';

dotenv.config()

/**
 * @typedef {Object} Helyadatok
 * @property {geoJsonPoint} szavazohelyisegHelye
 * @property {getJsonPoligon} korzethatar
 */

/**
* @typedef {Object} Szavazokor
* @property {number} szavazokorSzama
* @property {Object} KozigEgyseg
* @property {number} KozigEgyseg.megyeKod
* @property {number} KozigEgyseg.telepulesKod
* @property {string} vhuUrl
* @property {string} polygonUrl
*/

/**
 * @param {string} polygonUrl - a geo adatok url-je
 * @returns {promise} - which resolves center and path info in [lat, lng] format
 */
const getGeoData = async polygonUrl => {
  let message, center, paths;

  try {
    const { data } = await axios.get(polygonUrl);
    center = data && data.map && data.map.center;
    paths = data && data.polygon && data.polygon.paths;

    if (!center || !paths) throw new Error('no center or path fetched')

    center = mapCoordinates(center)
    paths = JSON.parse(paths).map(mapCoordinates)
    message = 'GEO data fetched.'
    return [{ center, paths }, message]
  } catch (error) {
    console.log(error.message)
    message = `!! GEO data error!, ${error.message}`
    return [{ center: null, paths: null }, message]
  }
}

/**
 * @param {string} vhuUrl - a szavazokor oldal linkje
 * @returns	{promise} which resolves html
 */
const fetchHtml = async (vhuUrl, save=false, szavazokor = null) => {
  let data, message;
  try {
    ;({ data } = await axios.get(vhuUrl))
    message = 'Html fetched.'
    if (save){

      const {
        kozigEgyseg: {
          megyeKod,
          telepulesKod
        },
        szavazokorSzama
      } = szavazokor;

      const fileName = `${pad(megyeKod, 2)}-${pad(telepulesKod, 3)}-${pad(szavazokorSzama, 3)}`

      await writeFile(`./htmls/backup/${fileName}.html`, data, 'utf8', err => {
        if (err) {
          console.log('error while writing', fileName)
        }
      })
  
    }
  } catch(error){
    console.log(error)
    message = '!! Error while fetching html!'
  }
  return [data, message]
}

const parseSzkHtml = async html => {
  const { data } = await axios({
    method: 'POST',
    url: `${process.env.PARSER_URL}/szk-parse`,
    data: html,
    headers: { 'Content-Type': 'text/html' }
  })
  return data;
}

/**
 * @param {Szavazokor} szavazokor 
 * @param {Object} options - to control the scraping
 * @param {Boolean} options.doFetchHtml - to fetch html
 * @param {Boolean} options.doSaveHtmlToFile - to fetch html
 * @param {Boolean} options.doGetGeoData - to get geo data
 * @param {Boolean} options.doParseSzkDetails - to parse szk details
 */
export default async (szavazokor, {
  doFetchHtml,
  doSaveHtmlToFile,
  doGetGeoData,
  doParseSzkDetails,
}) => {
  let {
    vhuUrl,
    polygonUrl,
  } = szavazokor;

  let html, center, paths, message, messages = [szavazokor['_id']], error, szkParsedData;

  if (doFetchHtml){
    ;[html, message] = await fetchHtml(vhuUrl, doSaveHtmlToFile, szavazokor)
    messages.push(message)
  }

  if (doGetGeoData){
    ;[{ center, paths }, message] = await getGeoData(polygonUrl)
    messages.push(message)
  }

  if (doParseSzkDetails) {
    try {
      szkParsedData = await parseSzkHtml(html)
      if (!szkParsedData.error)
        messages.push('Html parsed.')
      else 
        messages.push('Error while parsing html!')
    } catch(error){
      console.log(error)
      messages.push('Error while parsing html!')
    }
  }

  console.log(
    html.slice(0, 50),
    center,
    paths && paths.slice(0, 4),
    szkParsedData
  )

  return {
    messages,
    center,
    paths,
    szkParsedData
  }
}