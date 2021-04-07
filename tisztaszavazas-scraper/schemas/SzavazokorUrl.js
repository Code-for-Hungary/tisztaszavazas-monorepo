const { Schema } = require('mongoose')

const SzavazokorUrlSchema = Schema({
	url: String,
  query: Object
},
{
  timestamps: true
})

module.exports = SzavazokorUrlSchema