const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const URL = process.env.DATABASE;
const DB = process.env.DATABASE_NAME;
const client = new MongoClient(URL);

client
  .connect()
  .then(() => {
    console.log('Connected Successfully to MongoDB!');
    client.close();
  })
  .catch((error) => console.log('No connection...', error));

// 2) POST / create categories
app.post('/categories', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(DB)
      .collection('categories')
      .insertMany([
        {
          title: req.body.title,
          description: req.body.description,
        },
      ]);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 3) POST /create products with category ID
app.post('/products/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const data = await con
      .db(DB)
      .collection('products')
      .insertMany([
        {
          title: req.body.title,
          price: req.body.price,
          categoryId: new ObjectId(id),
        },
      ]);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 4) GET /get all categories
app.get('/categories', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db(DB).collection('categories').find().toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 5) GET  / get all products with category
app.get('/products', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(DB)
      .collection('products')
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category_info',
          },
        },
        {
          $unwind: '$category_info',
        },
      ])
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 6) GET / categoryvalue/ resulyatas: kiekvienos kategorijos produktu kainos sumos
app.get('/categoryvalue', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(DB)
      .collection('categories')
      .aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'products',
          },
        },
      ])
      .toArray();
    await con.close();

    const result = data.map(
      ({ title, products }) =>
        `${title}: ${products
          .map((el) => el.price)
          .reduce((acc, curr) => acc + curr, 0)}`
    );
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started at port ${port}...`));
