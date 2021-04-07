const { Schema } = require('mongoose')

const SzervezetSchema = new Schema({
  rovidNev: String,
  teljesNev: Number,
  logoUrl: String,
})

module.exports = SzervezetSchema
