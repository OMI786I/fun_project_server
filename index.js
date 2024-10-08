const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.ymyoldm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //for adding on mongodb

    const scoreCollection = client.db("funDB").collection("score");
    const feedBackCollection = client.db("funDB").collection("feedback");
    //sending on server
    app.post("/score", async (req, res) => {
      const newScore = req.body;
      console.log(newScore);
      const result = await scoreCollection.insertOne(newScore);
      res.send(result);
    });
    app.post("/feedback", async (req, res) => {
      const newFeedBack = req.body;
      console.log(newFeedBack);
      const result = await feedBackCollection.insertOne(newFeedBack);
      res.send(result);
    });

    app.get("/score", async (req, res) => {
      const filter = req.query;

      // Get pagination parameters
      const dataPerPage = parseInt(filter.dataPerPage) || 10; // Default to 10 per page if not provided
      const currentPage = parseInt(filter.currentPage) || 1; // Default to page 1 if not provided

      // Define the search query
      const query = {
        name: { $regex: filter.search || "", $options: "i" }, // Empty string if no search term is provided
      };

      // Sorting option
      const options = {
        sort: {
          score: filter.sort === "asc" ? 1 : -1, // Sort by score in ascending or descending order
        },
      };

      // Get the total count of documents that match the query
      const totalData = await scoreCollection.countDocuments(query);

      // Pagination calculation
      const totalPages = Math.ceil(totalData / dataPerPage);
      const skip = (currentPage - 1) * dataPerPage;

      // Fetch paginated data
      const result = await scoreCollection
        .find(query, options)
        .skip(skip)
        .limit(dataPerPage)
        .toArray();

      // Send the result to the front-end
      res.send({ totalPages, currentPage, dataPerPage, result });
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" server is running");
});

app.listen(port, () => {
  console.log(` server is running on port: ${port}`);
});
