import Process from "../schemas/Process";
import connectDb from '../functions/connectDb'
import scrapeMultiple from '../scrapeMultiple'
import getDbFromArgs from "./getDbFromArgs";

const { version, valasztasAzonosito } = getDbFromArgs()

const electionDb = `${valasztasAzonosito}_${version}`
const query = {}
const szavazokorId = '5ee6f5fa5034d4703f21ce05'

console.log(electionDb)

;(async () => {
	await connectDb()

	const { 0: { _id: processId } } = await Process.insertMany([{
		isRunning: true,
		doFetchHtml: true,
		doGetGeoData: true,
		doParseSzkDetails: true		
	}])

	await scrapeMultiple({
		szavazokorId,
		electionDb,
		query,
		processId
	})
})()