const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()

module.exports = async (dbName = process.env.MONGO_DBNAME) => {
	if (!mongoose.connection.readyState) {
		await mongoose.connect(process.env.MONGODB_URI, {
			user: process.env.MONGO_USER,
			pass: process.env.MONGO_PASSWORD,
			dbName,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			retryWrites: false,
			useFindAndModify: false,
		},
		err => {
			if (err) {
				console.log('connection error', err.message)
			} else {
				console.log('connected to DB', mongoose.connection.readyState)
			}
		})
	} else {
		console.log('db already connected')
	}
}
