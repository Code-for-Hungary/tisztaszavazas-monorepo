import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Szavazokor from '../schemas/Szavazokor';

dotenv.config()

;(async () => {
	const db = process.argv[2]
	console.log('connecting')
	await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
	console.log('connected')

	console.log('querying')

	const res = await Szavazokor[`Szavazokor_${db}`].updateMany(
		{},
		{ $set: { "kozteruletek.$[element].kezdoHazszam": 0 } },
		{ arrayFilters: [  { "element.kezdoHazszam": { $eq: null } } ], multi: true}
  )

	// const res = await Szavazokor[`Szavazokor_${db}`].find().limit(10)
  /* const res = await Szavazokor[`Szavazokor_${db}`].insertMany([{
    "kozteruletek": [
        {
            "leiras": "Martinovics Ignác utca",
            "kozteruletNev": "Martinovics Ignác utca",
            "kezdoHazszam": null,
            "vegsoHazszam": null,
            "megjegyzes": "Páros házszámok"
        },
        {
            "leiras": "Római körút 40 - 999998 9999 9999",
            "kozteruletNev": "Római körút",
            "kezdoHazszam": 40,
            "vegsoHazszam": 9999,
            "megjegyzes": "Páros házszámok"
        }
    ],
    "szavazokorSzama": 8,
    "kozigEgyseg": {
        "megyeKod": 7,
        "telepulesKod": 24,
        "megyeNeve": "Fejér",
        "kozigEgysegNeve": "Dunaújváros"
    },
    "akadalymentes": false,
    "frissitveValasztasHun": "2020-01-09T14:49:48.000Z",
    "szavazokorCime": "TEST Római krt. 51. (Gárdonyi Géza Ált.Isk.)",
    "valasztokerulet": {
        "leiras": "Dunaújváros 2. számú EVK",
        "szam": 2
    },
    "valasztokSzama": 559,
}]) */


	console.log(res && res[0] && res[0].kozteruletek)
	return
})()