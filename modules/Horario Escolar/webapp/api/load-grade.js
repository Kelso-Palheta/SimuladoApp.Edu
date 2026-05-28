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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, schoolName } = req.query;

  if (!email || !schoolName) {
    return res.status(400).json({ error: 'Missing required fields: email, schoolName' });
  }

  try {
    const client = await connectMongo();
    const db = client.db('horario_escolar');
    const grades = db.collection('grades');

    const doc = await grades.findOne({ email, schoolName });

    if (!doc) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.status(200).json({
      success: true,
      gradeData: doc.gradeData,
      updatedAt: doc.updatedAt
    });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: error.message });
  }
}
