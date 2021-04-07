import mongoose from 'mongoose';

const ProcessSchema = mongoose.Schema({
	isRunning: Boolean,
	doFetchHtml: Boolean,
	doSaveHtmlToFile: Boolean,
	doGetGeoData: Boolean,
	doParseSzkDetails: Boolean,
	doUpdateDb: Boolean,
	query: Object,
	electionDb: String,
	messages: Array
},
{
  timestamps: true
})

export default mongoose.model('Process', ProcessSchema);