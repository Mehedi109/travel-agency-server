const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ppmn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("travel-agency");
    console.log("connected");
    const experiencesCollection = database.collection("experiences");
    // const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    // const reviewsCollection = database.collection("reviews");

    // get api for products
    app.get("/experiences", async (req, res) => {
      const cursor = await experiencesCollection.find({}).toArray();
      res.send(cursor);
    });
    // get api of products for specific id
    app.get("/experiences/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await experiencesCollection.findOne(query);
      res.send(cursor);
    });
    // post api of order
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });
    // get api for order
    app.get("/orders", async (req, res) => {
      const cursor = await ordersCollection.find({}).toArray();
      res.send(cursor);
    });
    // delete api for order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // post api of experiences
    app.post("/addExperience", async (req, res) => {
      console.log(req.body);
      const name = req.body.name;
      const date = req.body.date;
      const time = req.body.time;
      const rent = req.body.rent;
      const rating = req.body.rating;
      const description = req.body.description;
      const image = req.files.image;
      const picData = image.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const newExperiences = {
        name,
        date,
        time,
        rent,
        rating,
        description,
        image: imageBuffer,
      };
      const result = await experiencesCollection.insertOne(newExperiences);
      console.log(result);
      res.json(result);
    });
    // delete api for products
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // get api for orders of login user
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });
    // post api for users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const cursor = await usersCollection.insertOne(user);
      res.send(cursor);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // post api for review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const cursor = await reviewsCollection.insertOne(review);
      res.send(cursor);
    });
    // get api for review
    app.get("/reviews", async (req, res) => {
      const cursor = await reviewsCollection.find({}).toArray();
      res.send(cursor);
    });
    // update status
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const result = ordersCollection.find({});
      console.log(result);
      const filter = { _id: ObjectId(id) };
      ordersCollection
        .updateOne(filter, {
          $set: { status: updatedStatus },
        })
        .then((result) => {
          res.send(result);
        });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running the server!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
