import connectDb from '../functions/connectDb'
import { Szavazokor, KozigEgyseg } from '../schemas';
import getDbFromArgs from './getDbFromArgs';
import { Types } from 'mongoose';

;(async () => {
	await connectDb()
	const { valasztasAzonosito, version } = getDbFromArgs()

	const Szavazokors = Szavazokor[valasztasAzonosito][version] || Szavazokor[valasztasAzonosito].latest
	const KozigEgysegs = KozigEgyseg[valasztasAzonosito][version] || KozigEgyseg[valasztasAzonosito].latest

	let records = await Szavazokors.find()

	for (let szavazokor of records) {
		try {
			const { kozigEgyseg: { _doc: { _id, ...kozigEgyseg }, _id: szavazokorId } } = szavazokor
			const options = { upsert: true, new: true, setDefaultsOnInsert: true };
			const kozigEgysegRef = await KozigEgysegs.findOneAndUpdate(kozigEgyseg, kozigEgyseg, options)
			await kozigEgysegRef.save()
			szavazokor.set({ kozigEgysegRef })
			await szavazokor.save()
			console.log(szavazokorId, 'updated')
		} catch(error){
			console.log(error)
		}
	}

	records = await Szavazokors.find({
    '_id': { $in: [
        Types.ObjectId('5ed382ed103c8ba7d263bdeb'),
        Types.ObjectId('5ed382ed103c8ba7d263bde5'),
		]}
	})
	
	console.log(records)


})()