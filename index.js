require('dotenv').config(); 
const { createRemoteJWKSet, jwtVerify } = require ('jose-cjs');
const express = require('express'); 
const cors = require('cors'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express(); 
const PORT = process.env.PORT || 5000;
const uri = process.env.CONNECTION_STRING;


app.use(cors()); 
app.use(express.json());

const jwks = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
  //   await client.connect();
    
    const db=await client.db("book-nook")
    const roomsCollection = await db.collection("rooms")
    const bookingsCollection = await db.collection("bookings")

    app.get('/',(req,res)=>{
        res.send("Book Nook server is running")
    })

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

    app.post('/allrooms',async(req,res)=>{
        const newRoom = req.body

        const result = await roomsCollection.insertOne(newRoom)

        res.send(result)
    })

    app.get('/allrooms/:id',async(req,res,next)=>{

      const headers =req?.headers?.authorization
    

      if(!headers){
        return res.status(401).json({
          message: "Unauthorized"
        })
      }

      const token = headers.split(" ")[1]

     
      if(!token){
        return res.status(401).json({
          message: "Unauthorized"
        })
      }

      try{
        const {payload} = await jwtVerify(token,jwks)
      
          next()
      }
      catch(err){
        return res.status(401).json({
          message: "Unauthorized"
        })
      }
    },async(req,res)=>{
        const id = await req.params.id

        const query ={ _id : new ObjectId(id)}

        const room = await roomsCollection.findOne(query)

        res.send(room)
    })
     app.get('/mybookings/:id',async(req,res,next)=>{

      
         const headers = req?.headers?.authorization

         if(!headers){
          return res.status(401).json({
            message: "Unauthorized"
          })
         }

          const token = headers.split(" ")[1]

          if(!token){
            return res.status(401).json({
              message: "Unauthorized"
            })
          }

          try{
            const {payload} = await jwtVerify(token,jwks)

        
            next()
          }
          catch(err){
            return res.status(401).json({
              message: "Unauthorized"
            })
          }
     },async(req,res)=>{
        const {id}= await req.params
        
      
        

        const result = await bookingsCollection.find({'bookerId':id}).toArray()

    
      
        res.send(result)
    })

    app.post('/bookings',async(req,res)=>{
        
      const newRoom = req.body
     

      const roomId = newRoom.room._id;
    

      const existingRoom = await bookingsCollection.findOne({'room._id':roomId})

     

      if (existingRoom) {
      
      return res.status(400).json({ 
        success: false, 
        message: "This room is already booked!" 
      })
    }
    else{
      const result = await bookingsCollection.insertOne(newRoom)
      res.send(result)
    }

      
    })


  } catch (error) {
    console.error("Database connection error:", error);
  }
  
}

run().catch(console.dir);


app.listen(PORT, () => {
  
});
