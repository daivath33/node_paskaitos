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

//CATEGORIES
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
        // {
        //   $group: {
        //     _id: { title: '$title' },
        //     totalAmount: { $sum: '$price' },
        //   },
        // },
        // {
        //   $group: {
        //     _id: '$_id',
        //     // size: {
        //     //   $sum: '$array',
        //     // },
        //   },
        // },
        // { $group: { _id: {category: '$title} }, totalAmount: { $sum: '$price' }}

        //'$title', products: {totalPrice: { $sum: '$price' } } },
      ])
      .toArray();
    await con.close();

    const result = data.map(
      ({ title, products }) =>
        `${title}: ${products
          .map((el) => el.price)
          .reduce((acc, curr) => acc + curr, 0)} Eur`
    );
    res.send(result);
    // res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/categoriesWithProducts', async (req, res) => {
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
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

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

//PRODUCTS
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

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started at port ${port}...`));
