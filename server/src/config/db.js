import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.warn('⚠️  MONGO_URI is not set in environment variables');
      console.warn('💡 Server will start but database features will not work');
      console.warn('💡 Create a .env file in server/ directory with:');
      console.warn('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aimate');
      console.warn('   Or use local: MONGO_URI=mongodb://localhost:27017/aimate');
      return; // Don't exit, allow server to start
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('💡 Server will continue but database features will not work');
    console.error('💡 Please check your MONGO_URI in the .env file');
    // Don't exit, allow server to start for testing
  }
};

