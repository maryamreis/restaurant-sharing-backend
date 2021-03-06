import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/restaurants", async (req, res) => {
  try {
    const dbres = await client.query('SELECT * FROM restaurants');
    res.json(dbres.rows);
    
  } catch (error) {
    console.error(error.message)
    
  }
  
});

// POST A restaurant
app.post("/restaurants", async (req, res) => {
  const {name, location, cuisine, rating, price, recommendedby, upvotes} = req.body;

  try {
    await client.query('INSERT INTO restaurants (name, location, cuisine, rating, price, recommendedby, upvotes) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, location, cuisine, rating, price, recommendedby, upvotes]);
    res.status(201).json({
      status: "success"
    })
    
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      status: "fail",
      error: error.message
    }); 
    
  }

});






//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
