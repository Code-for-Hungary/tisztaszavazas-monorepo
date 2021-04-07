const oevkGeometry = require('../temp/oevk-hatarok-2018.json')


const { ogy2018_v2_valasztokerulet: Valasztokerulets } = require('../schemas/Valasztokerulet')
const connectDb = require('../functions/connectDb')

const toGeoJson = paths => {
  const coordinates = [paths.map(({ lng, lat }) => [lng, lat])]
  const firstPoint = coordinates[0][0]
  const lastPoint = coordinates[0][coordinates[0].length - 1]
  const isClosed = firstPoint.join() === lastPoint.join()

  if (!isClosed){
    coordinates[0].push(firstPoint)
  }

  return {
    type: 'Polygon',
    coordinates
  }
}

;(async() => {
  await connectDb()
  const data = await Valasztokerulets.find({})

  toGeoJson(oevkGeometry.polygons[0].polygon.paths)

  for (let { _id, leiras } of data){
    console.log(leiras)

    const found = oevkGeometry.polygons.find(({ tooltip: { oevkName1, oevkName2 }}) => {
      return `${oevkName1} ${oevkName2}` === leiras
    })

    const res = await Valasztokerulets.findByIdAndUpdate({ _id }, { korzethatar: toGeoJson(found.polygon.paths) })
    console.log(res)
  }
})()
