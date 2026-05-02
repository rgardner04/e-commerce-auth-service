const createLogger = require("pino");
const createHttpLogger = require("pino-http");
const { LOG_LEVEL } = process.env;

let logger = null;
let httpLogger = null;

function getLogger() {
  if (logger) return logger;

  logger = createLogger({
    level: LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss Z" },
    },
  });
}

function getHttpLogger() {
  if (httpLogger) return httpLogger;

  httpLogger = createHttpLogger({
    level: LOG_LEVEL || "info",
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          query: req.query,
          params: req.params,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss Z" },
    },
  });
}

function onModuleInit() {
  getLogger();
  getHttpLogger();
}

(() => {
  onModuleInit();
})();

module.exports = {
  getLogger,
  getHttpLogger,
};
