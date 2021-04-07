const { model, Schema } = require('mongoose')

const SzavazokorUrlSchema = new Schema()
const SzavazokorSchema = new Schema()
const KozigEgysegSchema = new Schema()
const ValasztokeruletSchema = new Schema()
const SzavazatSchema = new Schema()
const ValasztasSchema = new Schema()

const onk2019_v1_szavazokor_url = model('onk2019_v1_szavazokor_url', SzavazokorUrlSchema)
const onk2019_v2_szavazokor_url = model('onk2019_v2_szavazokor_url', SzavazokorUrlSchema)
const ogy2018_v1_szavazokor_url = model('ogy2018_v1_szavazokor_url', SzavazokorUrlSchema)
const ogy2018_v2_szavazokor_url = model('ogy2018_v2_szavazokor_url', SzavazokorUrlSchema)
const idbo620_v1_szavazokor_url = model('idbo620_v1_szavazokor_url', SzavazokorUrlSchema)

const onk2019_v1_kozigegyseg = model('onk2019_v1_kozigegyseg', KozigEgysegSchema)
const onk2019_v2_kozigegyseg = model('onk2019_v2_kozigegyseg', KozigEgysegSchema)
const ogy2018_v1_kozigegyseg = model('ogy2018_v1_kozigegyseg', KozigEgysegSchema)
const ogy2018_v2_kozigegyseg = model('ogy2018_v2_kozigegyseg', KozigEgysegSchema)
const idbo620_v1_kozigegyseg = model('idbo620_v1_kozigegyseg', KozigEgysegSchema)

const onk2019_v1_valasztokerulet = model('onk2019_v1_valasztokerulet', ValasztokeruletSchema)
const onk2019_v2_valasztokerulet = model('onk2019_v2_valasztokerulet', ValasztokeruletSchema)
const ogy2018_v1_valasztokerulet = model('ogy2018_v1_valasztokerulet', ValasztokeruletSchema)
const ogy2018_v2_valasztokerulet = model('ogy2018_v2_valasztokerulet', ValasztokeruletSchema)
const idbo620_v1_valasztokerulet = model('idbo620_v1_valasztokerulet', ValasztokeruletSchema)

const onk2019_v1_szavazokor = model('onk2019_v1_szavazokor', SzavazokorSchema)
const onk2019_v2_szavazokor = model('onk2019_v2_szavazokor', SzavazokorSchema)
const ogy2018_v1_szavazokor = model('ogy2018_v1_szavazokor', SzavazokorSchema)
const ogy2018_v2_szavazokor = model('ogy2018_v2_szavazokor', SzavazokorSchema)
const idbo620_v1_szavazokor = model('idbo620_v1_szavazokor', SzavazokorSchema)

const ogy2018_v2_szavazat = model('ogy2018_v2_szavazat', SzavazatSchema)
const valasztasok = model('valasztasok', ValasztasSchema)


module.exports = {
  SzavazokorUrl: {
    onk2019: {
      v1: onk2019_v1_szavazokor_url,
      v2: onk2019_v2_szavazokor_url,
      latest: onk2019_v2_szavazokor
    },
    ogy2018: {
      v1: ogy2018_v1_szavazokor_url,
      v2: ogy2018_v2_szavazokor_url,
      latest: ogy2018_v1_szavazokor
    },
    idbo620: {
      v1: idbo620_v1_szavazokor_url,
      latest: idbo620_v1_szavazokor_url,
    }
  },
  Szavazokor: {
    onk2019: {
      v1: onk2019_v1_szavazokor,
      v2: onk2019_v2_szavazokor,
      latest: onk2019_v2_szavazokor
    },
    ogy2018: {
      v1: ogy2018_v1_szavazokor,
      v2: ogy2018_v2_szavazokor,
      latest: ogy2018_v2_szavazokor,
    },
    idbo620: {
      v1: idbo620_v1_szavazokor,
      latest: idbo620_v1_szavazokor,
    },		
  },
  KozigEgyseg: {
    onk2019: {
      v1: onk2019_v1_kozigegyseg,
      v2: onk2019_v2_kozigegyseg,
      latest: onk2019_v2_kozigegyseg,
    },
    ogy2018: {
      v1: ogy2018_v1_kozigegyseg,
      v2: ogy2018_v2_kozigegyseg,
      latest: ogy2018_v2_kozigegyseg,
    },
    idbo620: {
      v1: idbo620_v1_kozigegyseg,
      latest: idbo620_v1_kozigegyseg,
    },
  },
  Valasztokerulet: {
    onk2019: {
      v1: onk2019_v1_valasztokerulet,
      v2: onk2019_v2_valasztokerulet,
      latest: onk2019_v2_valasztokerulet
    },
    ogy2018: {
      v1: ogy2018_v1_valasztokerulet,
      v2: ogy2018_v2_valasztokerulet,
      latest: ogy2018_v2_valasztokerulet
    },
    idbo620: {
      v1: idbo620_v1_valasztokerulet,
      latest: idbo620_v1_valasztokerulet,
    },		
	},
	Szavazat: {
		ogy2018: {
      v2: ogy2018_v2_szavazat,
      latest: ogy2018_v2_szavazat
		}
	},
	Valasztas: valasztasok,
}