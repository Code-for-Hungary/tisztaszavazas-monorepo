import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Szavazokor from '../schemas/Szavazokor';
import sleep from '../functions/sleep'

dotenv.config()

const mapCoordinates = ({ lng, lat }) => [lng,lat]

;(async () => {
	const db = process.argv[2]
	console.log('connecting')
	await mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useFindAndModify: false
	})
	console.log('connected')

	console.log('querying')
	const id = '5e77c3f08723e7a7b25c45e9'

	const result = await Szavazokor[`Szavazokor_${db}`].find({
		'helyadatok.korzethatar': { $ne: null }
	})

	for (let { helyadatok, _id } of result) {
		try {
			await sleep(300)

			let { korzethatar, szavazokorKoordinatai } = helyadatok
			korzethatar = korzethatar && korzethatar.map(mapCoordinates)
			szavazokorKoordinatai = mapCoordinates(szavazokorKoordinatai)
			console.log({szavazokorKoordinatai})

 			await Szavazokor[`Szavazokor_${db}`].findByIdAndUpdate(_id,
				{ $set: {
					korzethatar: {
						type: 'Polygon',
						coordinates: [korzethatar]
					}
				} },
			)
 			await Szavazokor[`Szavazokor_${db}`].findByIdAndUpdate(_id,
				{ $set: {
					'szavazohelyisegHelye': {
						type: 'Point',
						coordinates: szavazokorKoordinatai
					}					
				} },
			)
			console.log(_id, 'updated')
		} catch(error){
			console.log(error.message)
		}
	}
	
	return
})()