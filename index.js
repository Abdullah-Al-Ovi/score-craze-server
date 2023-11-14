const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
app.use(cors()) 
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://cricketDB:ubTZqXfPPGVshItp@cluster0.wukhoja.mongodb.net/?retryWrites=true&w=majority";

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
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const matchCollection = client.db('cricketDB').collection('matchCollection')
    const openerCollection = client.db('cricketDB').collection('openerCollection')
    const totalRunCollection = client.db('cricketDB').collection('totalRunCollection')

    app.post('/matchToss',async(req,res)=>{
        const matchTossInfo = req.body 
        const result = await matchCollection.insertOne(matchTossInfo)
        res.send(result)
    })
    app.get('/matchToss',async(req,res)=>{
        const cursor = matchCollection.find({})
        const result = await cursor.toArray()
        res.send(result)
    })
    app.get('/totalRun',async(req,res)=>{
      const result = await totalRunCollection.findOne()
      res.send(result)
    })
    app.patch('/totalRun/:id', async (req, res) => {
      try {
        const { total_run } = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const update = {
          $set: {
            total_run: total_run
          }
        };
    
        const result = await totalRunCollection.updateOne(filter, update);
    
        if (result.modifiedCount === 1) {
          res.json({ message: 'Total run updated successfully' });
        } else {
          res.status(404).json({ error: 'Total run not found or not updated' });
        }
      } catch (error) {
        console.error('Error updating total run:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.patch('/roleChange/:id',async(req,res)=>{
      const id= req.params.id 
      let {role} = req.body 
      const filter = {_id:new ObjectId(id)}
      const update = {
        $set:{
          role: role
        }
      }
      const result =await openerCollection.updateOne(filter,update)
      res.send(result)
    })
    app.patch('/runChange/:id',async(req,res)=>{
      const id = req.params.id 
      let {run} = req.body
      const filter = {_id:new ObjectId(id)}
      const update = {
        $set:{
          run: run
        }
      }
      const result =await openerCollection.updateOne(filter,update)
      res.send(result)
    })
    
    // app.get('/opener',async(req,res)=>{
    //     const striker = req.query.striker
    //     const nonStriker = req.query.nonStriker
    //     const query = {striker: striker,nonStriker:nonStriker}
    //     const result = await openerCollection.findOne(query)
    //     res.send(result)
    // })
    // app.post('/opener',async(req,res)=>{
    //     const result = openerCollection.findOne()
    // })
    app.post('/opener',async(req,res)=>{
        const openerInfo = req.body 
        const {battingTeam,...playerInfo} = openerInfo
        // console.log(openerInfo);
        // console.log(battingTeam);
        // console.log(strikerInfo);
        // const battingTeamCollection =  client.db('cricketDB').collection(battingTeam);
        const result = await openerCollection.insertOne(openerInfo)
        res.send(result)
    })

    app.get('/opener',async(req,res)=>{
        const cursor = openerCollection.find({})
        const result =await cursor.toArray()
        res.send(result)
    })
    app.post('/create-collection/:collectionName', async (req,res) => {
        try {
          let collectionName = req.params.collectionName;
console.log(collectionName);

          const db = client.db('cricketDB');
          await db.createCollection(collectionName);
          res.status(201).json({ message: `Collection '${collectionName}' created successfully` });
        } catch (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });



  } finally {

    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',async (req, res) => {
  res.send('Hello, Express!');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
