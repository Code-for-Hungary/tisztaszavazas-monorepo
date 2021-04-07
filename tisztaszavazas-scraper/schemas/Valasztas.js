const { Schema } = require('mongoose')

const ValasztasSchema = new Schema({
  kod: String,
  leiras: Number,
  tipus: Number,
})

module.exports = ValasztasSchema
