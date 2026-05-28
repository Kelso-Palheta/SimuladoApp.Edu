import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectMongo() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, schoolName, gradeData } = req.body;

  if (!email || !schoolName || !gradeData) {
    return res.status(400).json({ error: 'Missing required fields: email, schoolName, gradeData' });
  }

  try {
    const client = await connectMongo();
    const db = client.db('horario_escolar');
    const grades = db.collection('grades');

    const result = await grades.updateOne(
      { email, schoolName },
      {
        $set: {
          email,
          schoolName,
          gradeData,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Grade saved',
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
}
