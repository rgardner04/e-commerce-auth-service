const express = require("express");
const router = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const registerSchema = require("../validators/registerValidator");
const loginSchema = require("../validators/loginValidator");
const verifyEmailSchema = require("../validators/verifyEmailValidator");
const authService = require("../services/authService");
const adminRegisterRequestsSchema = require("../validators/adminRegisterRequestsValidator");
const newRateLimiterMiddleware = require("../middlewares/newRateLimiterMiddleware");
const CustomRateLimiter = require("../utils/CustomRateLimiter");

router.post(
  "/register",
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerMinute", 25, 60, 30),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerHour", 250, 3600, 1800),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerDay", 2500, 86400, 43200),
  ),
  validatorMiddleware(registerSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.register(req.body);
    return res.status(status).send(body);
  }),
);

router.get("/register", (_req, res) => {
  const { status, body } = authService.getRegister();
  return res.status(status).send(body);
});

router.post(
  "/verify-email",
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerMinute", 25, 60, 30),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerHour", 250, 3600, 1800),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerDay", 2500, 86400, 43200),
  ),
  validatorMiddleware(verifyEmailSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.verifyEmail(req.body, res);
    return res.status(status).send(body);
  }),
);

router.get("/verify-email", (_req, res) => {
  const { status, body } = authService.getVerifyEmail();
  return res.status(status).send(body);
});

router.post(
  "/login",
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerMinute", 25, 60, 30),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerHour", 250, 3600, 1800),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerDay", 2500, 86400, 43200),
  ),
  validatorMiddleware(loginSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.login(req.body);
    return res.status(status).send(body);
  }),
);

router.get("/login", (_req, res) => {
  const { status, body } = authService.getLogin();
  return res.status(status).send(body);
});

router.post(
  "/admin/register",
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerMinute", 25, 60, 30),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerHour", 250, 3600, 1800),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerDay", 2500, 86400, 43200),
  ),
  validatorMiddleware(registerSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.adminRegister(req.body);
    return res.status(status).send(body);
  }),
);

router.get(
  "/admin/register/requests",
  validatorMiddleware(adminRegisterRequestsSchema),
  asyncWrapper(async (req, res) => {
    const { query } = req;
    const { status, body } = await authService.getAdminRegisterRequests(query);
    return res.status(status).send(body);
  }),
);

router.post(
  "/admin/login",
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerMinute", 25, 60, 30),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerHour", 250, 3600, 1800),
  ),
  newRateLimiterMiddleware(
    new CustomRateLimiter("postRegisterPerDay", 2500, 86400, 43200),
  ),
  validatorMiddleware(loginSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.adminLogin(req.body);
    return res.status(status).send(body);
  }),
);

module.exports = router;
