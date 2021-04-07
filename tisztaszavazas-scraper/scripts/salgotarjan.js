const pad = require('../utils/pad')
const fs = require('fs')

const poligons = []

for (let i = 1; i <= 40; i++) {
  let p = require(`../temp/Salgotarjan_polygonok/M13T103szkjkv${pad(i, 3)}.json`)
  p = {
    ...p,
    items: p.items.map(({ lng, lat }) => ({ lng: +lng, lat: +lat}))
  }
  poligons.push(p)
}

fs.writeFile('./poligons.json', JSON.stringify(poligons, null, 2), 'utf8', err => {
  console.log(err)
})
