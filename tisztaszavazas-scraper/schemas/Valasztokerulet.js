const { Schema } = require('mongoose')

const ValasztokeruletSchema = Schema({
	tipus: String,
	leiras: String,
	szam: Number,
	korzethatar:  {
		type: {
			type: String,
			enum: ['Polygon'],
			required: true
		},
		coordinates: {
			type: [[[Number]]], // Array of arrays of arrays of numbers
			required: true
		}
	}
})

module.exports = ValasztokeruletSchema
