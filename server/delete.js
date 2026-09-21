import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Hackathon from './models/Hackathon.js';
import Registration from './models/Registration.js';
import Submission from './models/Submission.js';
import Team from './models/Team.js';
import Notification from './models/Notification.js';

const models = [
  { name: 'Notification', model: Notification },
  { name: 'Submission', model: Submission },
  { name: 'Team', model: Team },
  { name: 'Registration', model: Registration },
  { name: 'Hackathon', model: Hackathon },
  { name: 'User', model: User },
];

const deleteAllDocuments = async () => {
  try {
    await connectDB();
    console.log('🗑️  Starting deletion of all documents from every model...\n');

    let totalDeleted = 0;

    for (const { name, model } of models) {
      const result = await model.deleteMany({});
      const count = result.deletedCount ?? 0;
      totalDeleted += count;
      console.log(`✅ [${name}] Deleted ${count} document(s)`);
    }

    // Also sweep any additional collections in the database
    const collections = mongoose.connection.collections;
    for (const collectionName of Object.keys(collections)) {
      const isAlreadyCovered = models.some(
        (m) => m.model.collection.collectionName === collectionName
      );
      if (!isAlreadyCovered) {
        const result = await collections[collectionName].deleteMany({});
        const count = result.deletedCount ?? 0;
        totalDeleted += count;
        console.log(`✅ [${collectionName}] Deleted ${count} document(s) (extra collection)`);
      }
    }

    console.log(`\n🎉 Successfully cleared all models! Total deleted: ${totalDeleted} document(s).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting documents:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

deleteAllDocuments();
