const mongoose = require("mongoose");
const { MONGO_DB_URI } = process.env;

async function initializeMongoDb() {
  try {
    if (!MONGO_DB_URI) {
      console.warn(
        "MONGO_DB_URI not configured in environment variables. Aborting MongoDB connection",
      );
      return;
    }
    await mongoose.connect(MONGO_DB_URI);
    console.log(`Connected to MongoDB at ${MONGO_DB_URI}`);
  } catch (error) {
    console.error(
      `Couldn't connect to MongoDB. Error: ${error instanceof Error ? error?.message : ""}`,
    );
  }
}

async function connectWithRetry() {
  const maxAttempts = 5;
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await initializeMongoDb();
      return;
    } catch (error) {
      console.warn(
        `Connection to MongoDB attempt ${attempts + 1} failed. Error: ${error instanceof Error ? error?.message : ""}`,
      );
      attempts++;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  console.error("Could not connect to MongoDB after maximum attempts.");
}

async function onModuleInit() {
  await connectWithRetry();
}

(async () => {
  await onModuleInit();
})();
