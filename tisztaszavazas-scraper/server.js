import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import processRoute from './routes/process';
import szavkorUrlRoute from './routes/szavkorurls';
import connectDb from './functions/connectDb';

dotenv.config()
const app =  express();

const corsOptions = {
  origin: '*',
  credentials: false
};

// Middlewares
app.use(bodyParser.json({limit: '50mb'}))
app.use(cors(corsOptions));

app.use('/processes', processRoute)
app.use('/szavkorurls', szavkorUrlRoute)

;(async () => {
	await connectDb();
})()

// Listen
var port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`listening on ${port}`)
})
