
const { readdirSync, readFile } = require("fs")

const folder = '../temp'

const readOevkFile = fileName => new Promise((resolve, reject) => {
  readFile(`${folder}/oevk-irsz-ogy2018/${fileName}`, 'utf8', (err, content) => {
    if (err) reject(err)
    else resolve(content)
  })  
})


;(async() => {
  let filenames = readdirSync(`${folder}/oevk-irsz-ogy2018`)

   
  let i = 0
  const data = []
  for (let file of filenames) {
    let content = await readOevkFile(file)
    content = JSON.parse(content)
    data.push(content)
    console.log(content)
    if (i === 3) break
    i++
  }

  console.log(data.length)

/*   await connectDb()
  const Settlements = model('settlements', settlementsSchema)
  console.log(data)
  const response = await Settlements.insertMany(data)
  console.log(response) */
})()