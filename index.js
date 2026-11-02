import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const PORT = 8000;
const app = express();

app.use(cors());
app.use(express.json());

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
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("unity-serve");
const destinationCollection = db.collection("upcoming_event");

//http://localhost:8000/add-event

app.post("/add-event", async (req, res) => {
  const data = req.body;

  if (!data.creatorEmail) {
    return res.status(400).send({
      message: "Creator email is required.",
    });
  }

  const result = await destinationCollection.insertOne(data);

  console.log(result);

  res.send(result);
});

app.get("/upcoming_events", async (req, res) => {
  const result = await destinationCollection.find().toArray();
  res.send(result);
});

app.get("/upcoming_event/:id", async (req, res) => {
  const { id } = req.params;

  const result = await destinationCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

//Manage Event
app.get("/my-events/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const events = await destinationCollection
    .find({ creatorEmail: email })
    .sort({ eventDate: 1 })
    .toArray();
  res.send(events);
});

app.put("/my-events/:id", async (req, res) => {
  const { id } = req.params;
  const { creatorEmail, ...updateData } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid event ID." });
  }
  if (!creatorEmail) {
    return res.status(400).send({ message: "Creator email is requried." });
  }

  const result = await destinationCollection.updateOne(
    {
      _id: new ObjectId(id),
      creatorEmail: creatorEmail,
    },
    {
      $set: updateData,
    }
  );
    if (result.matchedCount === 0) {
      return res.status(404).send({
        message: "Event not found or you are not the owner.",
      });
    }

    res.send({ message: "Event updated successfully."});

});

app.delete("/my-events/:id", async (req, res)=>{
  const { id } = req.params;
  const email = req.query.email;
  
    if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid event ID." });
  }
  if (!creatorEmail) {
    return res.status(400).send({ message: "Creator email is requried." });
  }

  const result = await destinationCollection.deleteOne({
    _id : new ObjectId(id),
    creatorEmail : email, 
  });

  if (result.deletedCount === 0){
    return res.status(400).send({
      message: "Event not found or you are not the owner.",
    })
  }
  res.send({message: "Event deleted successfully."});

})

app.get("/", (req, res) => {
  res.send({ message: `Server is ruuning on port ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server is ruuning on port ${PORT}`);
});
