const express = require("express");
const router = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const registerSchema = require("../validators/registerValidator");
const loginSchema = require("../validators/loginValidator");
const authService = require("../services/authService");

router.post(
  "/register",
  validatorMiddleware(registerSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.register(req.body);
    return res.status(status).send(body);
  }),
);

router.post(
  "/login",
  validatorMiddleware(loginSchema),
  asyncWrapper(async (req, res) => {
    const { status, body } = await authService.login(req.body);
    return res.status(status).send(body);
  }),
);

module.exports = router;
