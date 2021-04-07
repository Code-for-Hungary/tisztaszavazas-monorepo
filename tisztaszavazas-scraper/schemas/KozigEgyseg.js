const { Schema } = require('mongoose')

const KozigEgysegSchema = new Schema({
  megyeNeve: String,
  megyeKod: Number,
  telepulesKod: Number,
  kozigEgysegNeve: String,
})

module.exports = KozigEgysegSchema
