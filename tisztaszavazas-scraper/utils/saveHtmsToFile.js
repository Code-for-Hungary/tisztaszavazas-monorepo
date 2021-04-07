import dotenv from 'dotenv'
import mongoose from 'mongoose';
import { writeFile, write } from 'fs'
import { pad } from '../functions/generateVhuUrl'

import SourceHtml from "../schemas/SourceHtml";


dotenv.config()

;(async () => {
	await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })

	const sourceHtmlEntries = await SourceHtml.find({}, { html: 0, area: 0, url: 0 })

	for (let entry of sourceHtmlEntries) {
		const {
			_id: id,
			szavazokorSzama,
			kozigEgyseg: {
				telepulesKod,
				megyeKod
			}
		} = entry

		const { html } = await SourceHtml.findById(id)

		const fileName = `${pad(megyeKod, 2)}-${pad(telepulesKod, 3)}-${pad(szavazokorSzama, 3)}`

		await writeFile(`./htmls/backup/${fileName}.html`, html, 'utf8', err => {
			if (err) {
				console.log('error while writing', fileName)
			}
		})

		console.log(fileName, 'saved successfully')
	}
})()