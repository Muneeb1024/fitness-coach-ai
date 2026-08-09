import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(
            `[MongoDB] Connected successfully: ${conn.connection.host}`
        );
    } catch (error) {
        console.error(
            `[MongoDB] Connection failed: ${error.message}`
        );

        throw error;
    }
};

// import mongoose from 'mongoose';

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
//     });
//     console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
//   } catch (error) {
//     console.warn(`\n[MongoDB Connection Notice] ${error.message}`);
//     console.warn(`👉 To connect to MongoDB Atlas, add 0.0.0.0/0 to Network Access in MongoDB Atlas console.`);
//     console.warn(`👉 Operating with in-memory fallback for seamless local testing.\n`);
//   }
// };
