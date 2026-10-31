import express from "express";
import cors from "cors";
import 'dotenv/config'

import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.Mongodb_URL);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB();



const PORT = 8000;
const app  = express();


app.use(cors());
app.use(express.json());

app.get ('/', (req, res)=>{
    res.send({message: `Server is ruuning on port ${PORT}`})
})

app.listen(PORT, ()=>{
    console.log(`Server is ruuning on port ${PORT}`);
})
