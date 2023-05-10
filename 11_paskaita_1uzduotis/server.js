const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const URL = process.env.DATABASE;
const client = new MongoClient(URL);
const DB = process.env.DATABASE_NAME;

client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB...');
    client.close();
  })
  .catch((error) => console.error('no connection...', error));

app.get('/users', async (req, res) => {
  try {
    const con = await client.connect();
    const users = await con.db(DB).collection('users').find().toArray();
    await con.close();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/users', async (req, res) => {
  try {
    const con = await client.connect();
    const user = await con
      .db(DB)
      .collection('users')
      .insertMany([
        {
          name: req.body.name,
          phone: req.body.phone,
          city: req.body.city,
        },
      ]);
    await client.close();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/comments', async (req, res) => {
  try {
    const con = await client.connect();
    const comments = await con.db(DB).collection('comments').find().toArray();
    await con.close();
    res.send(comments);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/commentsWithUsers', async (req, res) => {
  try {
    const con = await client.connect();
    const comments = await con
      .db(DB)
      .collection('comments')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user_info',
          },
        },
        {
          $unwind: '$user_info',
        },
      ])
      .toArray();
    await con.close();
    res.send(comments);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/comments/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const comment = await con
      .db(DB)
      .collection('comments')
      .insertMany([
        {
          date: Date.now(),
          text: req.body.text,
          userId: new ObjectId(id),
        },
      ]);
    await con.close();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.delete('/comments/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const comment = await con
      .db(DB)
      .collection('comments')
      .deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'successfully deleted...' });
    await con.close();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server started at port ${port}`));
