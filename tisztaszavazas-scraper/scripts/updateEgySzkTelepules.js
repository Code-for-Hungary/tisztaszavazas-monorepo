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
	const res = await Szavazokor[`Szavazokor_${db}`].updateMany({}, { $unset: { 'egySzavazokorosTelepules': '' }})

	console.log(res)
	return
})()