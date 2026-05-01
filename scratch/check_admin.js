const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/selfdrive"; // Adjust if needed
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('selfdrive');
    const admin = await db.collection('users').findOne({ email: 'admin@kasika.com' });
    console.log('Admin user in DB:', JSON.stringify(admin, null, 2));
    
    // Fix: Ensure they have both isAdmin and role if they don't
    if (admin && (!admin.isAdmin || !admin.role)) {
      await db.collection('users').updateOne(
        { email: 'admin@kasika.com' },
        { $set: { isAdmin: true, role: 'admin' } }
      );
      console.log('Updated admin user with required flags');
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
