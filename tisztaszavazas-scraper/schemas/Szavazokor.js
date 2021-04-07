const { Schema, model } = require('mongoose')
const KozigEgyseg = require('./KozigEgyseg')
const Valasztokerulet =require( './Valasztokerulet')

// https://stackoverflow.com/questions/55096055/mongoose-different-ways-to-reference-subdocuments

const KorzethatarSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true
  }
});

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const Kozterulet = Schema({
	"leiras": String,
	"kozteruletNev": String,
	"kezdoHazszam": Number,
	"vegsoHazszam": Number,
	"megjegyzes": String,
})

model('KozigEgysegModel', KozigEgyseg);
const kozigEgysegWithRefSchema = new Schema(KozigEgyseg)
kozigEgysegWithRefSchema.kozigEgysegRef = {
  type: Schema.Types.ObjectId,
  ref: 'KozigEgysegModel'
}
new Schema(kozigEgysegWithRefSchema)

model('ValasztokeruletModel', Valasztokerulet);
const valaztokeruletWithRefSchema = new Schema(Valasztokerulet)
valaztokeruletWithRefSchema.valasztoKeruletRef = {
  type: Schema.Types.ObjectId,
  ref: 'ValasztokeruletModel'
}
new Schema(valaztokeruletWithRefSchema)


const SzavazokorSchema = Schema({
  szavazokorSzama: Number,
  szavazokorCime: String,
  kozigEgyseg: {
    type: Object,
    ref: 'kozigEgysegWithRefSchema'
  },
  valasztokerulet: {
    type: Object,
    ref: 'valaztokeruletWithRefSchema'
  },
  kozteruletek: [{
    type: Object,
    ref: 'Kozterulet'
  }],
  vhuUrl: String,
  korzethatar: KorzethatarSchema,
  szavazohelyisegHelye: PointSchema,
  polygonUrl: String,
  sourceHtmlUpdated: Date,
  parsedFromSrcHtml: Date,
  akadalymentes: Boolean,
  frissitveValasztasHun: Date,
  valasztokSzama: Number,
  valasztas: {
    kod: String,
    leiras: String,
    tipus: {
      type: String,
      enum: [
        'Általános országgyűlési választás',
        'Általános helyi önkormányzati választás',
        'Időközi országgyűlési választás',
        'Időközi helyi önkormányzati választás',
      ]
    }
  }
},
{
  timestamps: true  
})

 module.exports = SzavazokorSchema
