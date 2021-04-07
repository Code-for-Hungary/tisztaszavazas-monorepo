const mongoose = require('mongoose')

const UsageSchema = mongoose.Schema({
	name: String,
  ip: String
},
{
  timestamps: true,
})

module.exports = UsageSchema
