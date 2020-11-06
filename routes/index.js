const { Router } = require('express');
const authCtrl = require('./auth.ctrl');
const loginCtrl = require('./login.ctrl');
const logoutCtrl = require('./logout.ctrl');
const signupCtrl = require('./signup.ctrl');

const authRouter = Router();

authRouter.post('/auth', authCtrl);
authRouter.post('/signup', signupCtrl);
authRouter.post('/login', loginCtrl);
authRouter.post('/logout', logoutCtrl);

module.exports = authRouter;
