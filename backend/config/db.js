import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		console.log("Attempting to connect to MongoDB...");
		console.log("MongoDB URI:", process.env.MONGO_URI);
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
		mongoose.connection.on('error', (error) => {
			console.error('MongoDB connection error:', error);
		});
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected');
		});
		mongoose.connection.on('reconnected', () => {
			console.log('MongoDB reconnected');
		});
	} catch (error) {
		console.error(`MongoDB connection error: ${error.message}`);
		console.error("Make sure MongoDB is running on your system");
		process.exit(1);
	}
};