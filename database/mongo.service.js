import mongoose from "mongoose";
import { config } from 'dotenv';
config();

let connect = () => {
  const options = {
    // user: process.env.MONGO_USERNAME,
    // pass: process.env.MONGO_PASSWORD,
    // keepAlive: true,
    // keepAliveInitialDelay: 300000,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false
    
  };
  mongoose.connect(process.env.MONGO_URL, options);

  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to ' + process.env.MONGO_URL);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    console.log('handle mongo errored connections: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
  });
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('App terminated, closing mongo connections');
      process.exit(0);
    });
  });
};

export default connect;