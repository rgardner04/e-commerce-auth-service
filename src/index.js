require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { PORT, MONGO_DB_URI } = process.env;
const errorMiddleware = require("./middlewares/errorMiddleware");
const rateLimiterMiddleware = require("./middlewares/rateLimiterMiddleware");
const apiRouter = require("./routes/apiRouter");

const express = require("express");
const app = express();

app.enable("trust proxy");

app.use(express.json());

app.use(rateLimiterMiddleware);

app.use("/api", apiRouter);

app.use(errorMiddleware);

async function startApplication() {
  try {
    setTimeout(async () => {
      await mongoose.connect(MONGO_DB_URI);
    }, 10000);

    app.listen(parseInt(PORT) || 3000, () => {
      console.log(`Server is running at port: ${PORT || 3000}`);
    });
  } catch (error) {
    console.log(`Error while starting the application: ${error?.message}`);
  }
}

(async () => {
  await startApplication();
})();
