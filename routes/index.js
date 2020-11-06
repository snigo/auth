const { Router } = require('express');
const authCtrl = require('./auth.ctrl');
const loginCtrl = require('./login.ctrl');
const logoutCtrl = require('./logout.ctrl');
const signupCtrl = require('./signup.ctrl');
const extendCtrl = require('./extend.ctrl');
const serviceCtrl = require('./service.ctrl');
const { serviceAuthMW, adminAuthMW } = require('./service.mw');

const authRouter = Router();

authRouter.post('/auth', serviceAuthMW, authCtrl);
authRouter.put('/auth', serviceAuthMW, extendCtrl);
authRouter.post('/signup', serviceAuthMW, signupCtrl);
authRouter.post('/login', serviceAuthMW, loginCtrl);
authRouter.post('/logout', serviceAuthMW, logoutCtrl);
authRouter.post('/service', adminAuthMW, serviceCtrl);

module.exports = authRouter;
