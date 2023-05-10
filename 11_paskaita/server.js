const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const URL = process.env.DATABASE;
const client = new MongoClient(URL);

client
  .connect()
  .then(() => {
    console.log('Connected Successfully to MongoDB!');
    client.close();
  })
  .catch((error) => console.log('No connection...', error));

//GET ALL OWNERS
app.get('/owners', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('owners')
      .find()
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

//GET ALL PETS
app.get('/pets', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('pets')
      .find()
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/ownersWithPets', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('owners')

      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/petsWithOwners', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('pets')
      .aggregate([
        {
          $lookup: {
            from: 'owners',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'owner_info',
          },
        },
        {
          $unwind: '$owner_info',
        },
      ])
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    await con
      .db('ManoDuomenuBaze')
      .collection('users')
      .deleteOne({ _id: new ObjectId(id) });
    res.send({ message: 'successfully deleted...' });
    await con.close();
  } catch (error) {
    ews.status(500).send(error);
  }
});
app.post('/owners', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('owners')
      .insertMany([
        {
          name: 'Rita',
          email: 'rita@example.com',
          city: 'Kaunas',
          income: 3500,
        },
        {
          name: 'Jonas',
          email: 'jonas@example.com',
          city: 'Kaunas',
          income: 5500,
        },
        {
          name: 'Lina',
          email: 'lina@example.com',
          city: 'Vilnius',
          income: 3500,
        },
        {
          name: 'Petras',
          email: 'petras@example.com',
          city: 'Klaipeda',
          income: 2500,
        },
        {
          name: 'Rimas',
          email: 'rimas@example.com',
          city: 'Vilnius',
          income: 3500,
        },
        {
          name: 'Edita',
          email: 'edita@example.com',
          city: 'Vilnius',
          income: 3500,
        },
      ]);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

//INSERT ONE PET WITH OWNER ID
app.post('/pets/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('pets')
      .insertOne({
        type: req.body.type,
        name: req.body.name,
        ownerId: new ObjectId(id),
      });
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.post('/pets', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('ManoDuomenuBaze')
      .collection('pets')
      .insertMany([
        {
          type: 'Cat',
          name: 'Murka',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a832'),
        },
        {
          type: 'Cat',
          name: 'Rainis',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a833'),
        },
        {
          type: 'Dog',
          name: 'Meskis',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a834'),
        },
        {
          type: 'Dog',
          name: 'Juodis',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a834'),
        },
        {
          type: 'Cat',
          name: 'Lokis',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a835'),
        },
        {
          type: 'hamster',
          name: 'Ryzukas',
          ownerId: new ObjectId('645a70a50fcf1bdabed5a837'),
        },
      ]);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});
//type: "dog", name: "Mikis", ownerId: new ObjectId('jhjkhjhl')
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started at port ${port}...`));
