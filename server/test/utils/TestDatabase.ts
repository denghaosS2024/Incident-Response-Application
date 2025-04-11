import { MongoMemoryServer } from "mongodb-memory-server-core";
import mongoose from "mongoose";

import * as Database from "../../src/utils/Database";

let mongo: MongoMemoryServer;

export const connect = async () => {
  mongo = await MongoMemoryServer.create();
  const testDBUrl = mongo.getUri();

  await Database.connect(testDBUrl, false);
};

export const close = async () => {
  if (mongo) {
    await mongoose.connection.db.dropDatabase();
    await Database.close();
    await mongo.stop();
  }
};

export const resetDatabase = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};
