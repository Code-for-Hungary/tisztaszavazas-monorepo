const { Schema, model } = require('mongoose')
const SzavazokorSchema = require('./Szavazokor')
const ValasztasSchema = require('./Valasztas')
const SzervezetSchema = require('./Szervezet')

const {
  PARTLISTAS_ORSZAGGYULESI_KEPVISELO,
  EGYENI_VALASZTÓKERULETI_KEPVISELO,
  FOPOLGARMESTER,
  POLGARMESTER,
  MEGYEI_KOZGYULESI_KEPVISELO,
  KEPVISELOTESTULETI_KEPVISELO,
  FUGGETLEN,
  KOZOS_PARTLISTA,
  ONALLO_PARTLISTA,
} = require('./constants')

model('SzavazokorModel', SzavazokorSchema)
model('ValasztasModel', ValasztasSchema)

const szavazokorWithRef = new Schema(SzavazokorSchema)
szavazokorWithRef.szavazokorRef = {
  type: Schema.Types.ObjectId,
  ref: 'SzavazokorModel'
}
new Schema(szavazokorWithRef)

const valasztasWithRef = new Schema(ValasztasSchema)
valasztasWithRef.valasztasRef = {
  type: Schema.Types.ObjectId,
  ref: 'ValasztasModel'
}
new Schema(valasztasWithRef)

const SzavazatSchema = new Schema({
  szavazokor: {
    type: Object,
    ref: 'szavazokorWithRef'
  },
  valasztas: {
    type: Object,
    ref: 'valasztasWithRef'
  },
  jeloles: {
    pozicio: {
      type: String,
      enum: [
        PARTLISTAS_ORSZAGGYULESI_KEPVISELO,
        EGYENI_VALASZTÓKERULETI_KEPVISELO,
        FOPOLGARMESTER,
        POLGARMESTER,
        MEGYEI_KOZGYULESI_KEPVISELO,
        KEPVISELOTESTULETI_KEPVISELO,
      ]
    },
    jelolt: String,
    jelolo: [{
      tipus: {
        type: String,
        enum: [
          FUGGETLEN,
          KOZOS_PARTLISTA,
          ONALLO_PARTLISTA,
        ]
      },
      szervezet: [SzervezetSchema]
    }]
  },
  ervenyesSzavazat: Number,
})

module.exports = SzavazatSchema
