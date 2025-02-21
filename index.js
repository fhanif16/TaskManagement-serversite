const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 5000;

//middle ware

app.use(cors ());
app.use(express.json());





console.log(process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i3f2q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");




    const taskCollection = client.db('taskManager').collection('task');

    
    app.get('/task', async(req, res)=>{
        const result = await taskCollection.find().toArray();
        res.send(result);
    })




//--------------------------------------------------------



    app.post('/task', async (req, res) => {
        const { title, description, category, userEmail } = req.body;
        if (!title || title.length > 50) {
          return res.status(400).send({ message: "Title is required (max 50 chars)" });
        }
        if (description && description.length > 200) {
          return res.status(400).send({ message: "Description max 200 chars" });
        }
  
        const newTask = {
          title,
          description: description || "",
          timestamp: new Date(),
          category: category || "To-Do",
          userEmail: userEmail, 
        };
        const result = await taskCollection.insertOne(newTask);
        res.send(result);
      });
  
      // Edit a task
      app.put('/task/:id', async (req, res) => {
        const { id } = req.params;
        const { title, description, category } = req.body;
  
        if (title && title.length > 50) {
          return res.status(400).send({ message: "Title max 50 chars" });
        }
        if (description && description.length > 200) {
          return res.status(400).send({ message: "Description max 200 chars" });
        }
  
        const updatedTask = {
          $set: { title, description, category }
        };
  
        const result = await taskCollection.updateOne({ _id: new ObjectId(id) }, updatedTask);
        res.send(result);
      });
  
      // Delete a task
      app.delete('/task/:id', async (req, res) => {
        const { id } = req.params;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      });
  
      // Change task category (drag and drop)
      app.patch('/task/:id/category', async (req, res) => {
        const { id } = req.params;
        const { category } = req.body;
  
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category } }
        );
        res.send(result);
      });
      


      //--------------------

















    
   

  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);









app.get('/' , (req, res) => {
    res.send("my task is running")
})

app.listen(port , ()=> {
    console.log(`task server is running ${port}` )
})
