require("dotenv").config({ path: "../.env" });
const { PORT } = process.env;
require("./services/mongoDbService");
const errorMiddleware = require("./middlewares/errorMiddleware");
const rateLimiterMiddleware = require("./middlewares/rateLimiterMiddleware");
const apiRouter = require("./routes/apiRouter");
const loggerService = require("./services/loggerService");

const express = require("express");
const app = express();

app.enable("trust proxy");

app.use(loggerService.getHttpLogger());

app.use(express.json());

app.use(rateLimiterMiddleware);

app.use("/api", apiRouter);

app.use(errorMiddleware);

async function startApplication() {
  try {
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
