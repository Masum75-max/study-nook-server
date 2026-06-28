require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express(); 
const PORT = process.env.PORT || 5000;
const uri = process.env.CONNECTION_STRING;


app.use(cors()); 
app.use(express.json());



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    
    const db=await client.db("book-nook")
    const roomsCollection = await db.collection("rooms")

    app.get('/homerooms',async(req,res)=>{
        const cursor =   roomsCollection.find().limit(6);

        const homeRooms=await cursor.toArray();

        res.send(homeRooms)
    })

    app.get('/allrooms',async(req,res)=>{

        const cursor = roomsCollection.find()

        const allRooms = await cursor.toArray()

        res.send(allRooms)
    })
   
    app.get('/allrooms/:id',async(req,res)=>{
        const id =  req.params.id

        const query ={ _id : new ObjectId(id)}

        const room = await roomsCollection.findOne(query)

        res.send(room)
    })


  } catch (error) {
    console.error("Database connection error:", error);
  }
  
}

run().catch(console.dir);


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});