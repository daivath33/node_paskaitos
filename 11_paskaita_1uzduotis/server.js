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

// 1) GET /users/ atsius visus vartotojus
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

// 2) POST /users/ irasys viena vartotoja
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

// 3) GET /comments/ atsius visus komentarus su vartotoju vardais (date, comment ir name od user)
app.get('/comments', async (req, res) => {
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
      ])
      .toArray();
    await con.close();
    const result = comments.map(
      ({ text, date, user_info }) =>
        `(${date}), '${text}', /${user_info.map((el) => el.name)}/`
    );
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 4) DELETE /comments/:id istrins viena komentara pagal jo ID
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
// POST /comments/ irasys viena komentara su vartotojo ID
app.post('/comments/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const comment = await con
      .db(DB)
      .collection('comments')
      .insertMany([
        {
          date: new Date().toISOString(),
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
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server started at port ${port}`));
