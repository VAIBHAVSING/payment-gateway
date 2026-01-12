import mongoose from 'mongoose';

const connection = {
  isConnected: 0
};

async function connect_to_the_db() {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(process.env.MONGODB_URI as string);

  connection.isConnected = db.connections[0].readyState;
}

export default connect_to_the_db;
