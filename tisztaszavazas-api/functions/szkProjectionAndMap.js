const mapKozteruletek = kozteruletek => kozteruletek && kozteruletek.map(({
  leiras, kozteruletNev, kezdoHazszam, vegsoHazszam, megjegyzes
}) => ({ leiras, kozteruletNev, kezdoHazszam, vegsoHazszam, megjegyzes }))

const getProjection = ({ roles }, context) => {
  const isAdmin = roles && roles.includes('admin')

  let projection = {
    sourceHtmlUpdated: 0,
    parsedFromSrcHtml: 0,
    createdAt: 0,
    vhuUrl: 0,
    polygonUrl: 0,
		helyadatok: 0
  }

  switch (context) {
    case 'withQuery':
    case 'noQuery': return ({
      kozteruletek: 0,
      sourceHtmlUpdated: 0,
      frissitveValasztasHun: 0,
      parsedFromSrcHtml: 0,
      vhuUrl: 0,
      polygonUrl: 0,
      createdAt: 0,
      updatedAt: 0,
      valasztasAzonosito: 0,
      helyadatok: 0
    })

    case 'filterStreet': return ({
      szavazokorSzama: 1,
      'kozigEgyseg._id': 1,
      'kozigEgyseg.kozigEgysegNeve': 1,
      'kozigEgyseg.megyeNeve': 1,
      'kozigEgyseg.megyeKod': 1,
      'kozigEgyseg.telepulesKod': 1,
      'valasztokerulet': 1,
      szavazokorCime: 1,
    })

    case 'withRegex': return ({
      ...projection,
      frissitveValasztasHun: 0,
      szavazokorCime: 0,
      valasztokSzama: 0,
      valasztokerulet: 0,
      akadalymentes: 0,
      updatedAt: 0,
      helyadatok: 0
    })

    case 'byId':
    default:
      if (isAdmin) {
        delete projection['kozigEgyseg.megyeKod']
        delete projection['kozigEgyseg.telepulesKod']
        delete projection.polygonUrl
        delete projection.vhuUrl
      }
      return projection
  }
}

const mapQueryResult = (result, query) => {
  return result.map(({
    _id,
    __v,
    ...doc
}) => {
  doc = doc._doc || doc

  const {
    kozigEgyseg,
    szavazokorSzama,
    kozteruletek,
    szavazokorCime,
    akadalymentes,
    valasztokerulet,
    valasztokSzama,
    ...rest
  } = doc

  const entry = {
    _id,
    szavazokorSzama,
    kozigEgyseg: {
      _id: kozigEgyseg['_id'],
      kozigEgysegNeve: kozigEgyseg.kozigEgysegNeve,
      megyeNeve: kozigEgyseg.megyeNeve,
      link: `/kozigegysegek/${kozigEgyseg['_id']}`
    },
    szavazokorCime,
    akadalymentes,
    valasztokerulet,
    kozteruletek: mapKozteruletek(kozteruletek),
    valasztokSzama,
    __v
  }

  Object.keys(query).forEach(key => {
    key = key.split('.')[0]
    if (rest[key]) entry[key] = rest[key]
  })           

  return entry
})}

const mapIdResult = (
  {
    _id,
    szavazokorSzama,
    valasztokerulet,
    kozigEgyseg,
    szavazokorCime,
    akadalymentes,
    valasztokSzama,
    kozteruletek,
    frissitveValasztasHun,
    updatedAt,
    helyadatok,
    korzethatar,
    szavazohelyisegHelye,
    valasztas,
    __v
  }, db, kozigEgysegSzavazokoreinekSzama
  ) => ({
    _id,
    szavazokorSzama,
    kozigEgyseg: {
      _id: kozigEgyseg['_id'],
      kozigEgysegNeve: kozigEgyseg.kozigEgysegNeve,
      megyeNeve: kozigEgyseg.megyeNeve,
      kozigEgysegSzavazokoreinekSzama,
      link: `/kozigegysegek/${kozigEgyseg['_id']}`
    },
    szavazokorCime,
    akadalymentes,
    valasztokSzama,
    valasztokerulet,
    kozteruletek: mapKozteruletek(kozteruletek),
    helyadatok,
    korzethatar,
    szavazohelyisegHelye,
    frissitveValasztasHun,
    valasztasHuOldal: `/vhupage/${db}/${_id}`,
    valasztas,
    updatedAt,
    __v
})

module.exports = {
  getProjection,
  mapQueryResult,
  mapIdResult,
}