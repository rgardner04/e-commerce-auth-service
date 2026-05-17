const express = require("express");
const router = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const registerSchema = require("../validators/registerValidator");
const loginSchema = require("../validators/loginValidator");
const verifyEmailSchema = require("../validators/verifyEmailValidator");
const authService = require("../services/authService");
const adminRegisterRequestsSchema = require("../validators/adminRegisterRequestsValidator");

router.post(
  "/register",
  validatorMiddleware(registerSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.register(req.body);
    return res.status(status).send(body);
  }),
);

router.get("/register", (_, res) => {
  const { status, body } = authService.getRegister();
  return res.status(status).send(body);
});

router.post(
  "/verify-email",
  validatorMiddleware(verifyEmailSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.verifyEmail(req.body, res);
    return res.status(status).send(body);
  }),
);

router.get("/verify-email", (_, res) => {
  const { status, body } = authService.getVerifyEmail();
  return res.status(status).send(body);
});

router.post(
  "/login",
  validatorMiddleware(loginSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.login(req.body);
    return res.status(status).send(body);
  }),
);

router.get("/login", (_, res) => {
  const { status, body } = authService.getLogin();
  return res.status(status).send(body);
});

router.post(
  "/admin/register",
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
  validatorMiddleware(loginSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.adminLogin(req.body);
    return res.status(status).send(body);
  }),
);

module.exports = router;
