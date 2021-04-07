const { model, Types } = require('mongoose')
const { parse } = require('papaparse')
const axios = require('axios')
const connectDb = require('../functions/connectDb')
const SzavazatSchema = require('../schemas/Szavazat')
const SzavazokorSchema = require('../schemas/Szavazokor')
const { PARTLISTAS_ORSZAGGYULESI_KEPVISELO, EGYENI_VALASZTÓKERULETI_KEPVISELO, ONALLO_PARTLISTA, KOZOS_PARTLISTA, FUGGETLEN } = require('../schemas/constants')

const Szavazats = model('ogy2018_v2_szavazat', SzavazatSchema)
const Szavazokors = model('ogy2018_v2_szavazokor', SzavazokorSchema)

const gid = 1604580305

const toJson = r => r

const resolveJelolo = part => {
  switch (part) {
    case 'dk':     return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'DK' }] }
    case 'egyutt': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'EGYÜTT' }] }
    case 'fidesz': return { tipus: KOZOS_PARTLISTA, szervezet: [{ rovidNev: 'FIDESZ' }, { rovidNev: 'KDNP' }] }
    case 'jobbik': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'JOBBIK' }] }
    case 'lmp': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'LMP' }] }
    case 'mszp': return { tipus: KOZOS_PARTLISTA, szervezet: [{ rovidNev: 'MSZP' }, { rovidNev: 'PM' }] }
    case 'momentum': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'MOMENTUM' }] }
    case 'mkkp': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'MKKP' }] }
    case 'fuggetlen': return { tipus: FUGGETLEN, szervezet: null }
    case 'egyeb': return { tipus: ONALLO_PARTLISTA, szervezet: [{ rovidNev: 'Egyéb' }] }
      
      break;
  
    default:
      break;
  }
}

const resolveJeloles = kod => {
  const [tipus, part] = kod.split('_')
  switch (tipus) {
    case 'orsz': return {
      pozicio: PARTLISTAS_ORSZAGGYULESI_KEPVISELO,
      jelolt: null,
      jelolo: resolveJelolo(part)
    }
    case 'egyeni': return {
      pozicio: EGYENI_VALASZTÓKERULETI_KEPVISELO,
      jelolt: 'N/A',
      jelolo: resolveJelolo(part)
    }
    case 'mellar': return {
      pozicio: EGYENI_VALASZTÓKERULETI_KEPVISELO,
      jelolt: 'Mellár Tamás',
      jelolo: resolveJelolo('fuggetlen')
    }
    case 'kesz': return {
      pozicio: EGYENI_VALASZTÓKERULETI_KEPVISELO,
      jelolt: 'Kész Zoltán',
      jelolo: resolveJelolo('fuggetlen')
    }
    default:
      break;
  }
}

;(async() => {
  await connectDb()

  const { data } = await axios({
    method: 'GET',
    url: `${process.env.GOOGLE_DOCS_URL}/pub?gid=${gid}&output=csv`
  })

  const result = await new Promise(resolve => parse(data, {
    header: true,
    complete: r => resolve(toJson(r.data)),
    delimiter: ','
  }))

  const valasztas = {
    _id: Types.ObjectId('6004713ca6932f5deae8f45b'),
    kod: 'ogy2018',
    leiras: 'Országgyűlési képviselők választása 2018',
  }

  for (let record of result) {
    const {
      szavazokor,
      megyeid,
      telepid,
    } = record

    const { _doc: {
      _id,
      szavazokorSzama,
      kozigEgyseg,
      valasztokerulet,
    }} = await Szavazokors.findOne({ 
      szavazokorSzama: szavazokor,
      'kozigEgyseg.megyeKod': +megyeid,
      'kozigEgyseg.telepulesKod': +telepid,
    })

    let i = 0
    const szavazokorSzavazatai = []
    
    for (let [key, darab] of Object.entries(record)) {
      if (i < 16 || i > 35) {
        i++
        continue
      }

      const szavazat = {
        szavazokor: {
          _id,
          szavazokorSzama,
          kozigEgyseg,
          valasztokerulet,
        },
        valasztas,
        jeloles: resolveJeloles(key),
        ervenyesSzavazat: +darab,
      }

      szavazokorSzavazatai.push(szavazat)

      i++
    }  

    insertResponse = await Szavazats.insertMany(szavazokorSzavazatai)
    console.log(insertResponse)
  }
})()