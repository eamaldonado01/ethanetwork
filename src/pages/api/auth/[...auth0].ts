// src/pages/api/auth/[...auth0].ts
import {
  handleAuth,
  handleLogin,
  handleCallback,
  handleLogout,
} from '@auth0/nextjs-auth0';

export default handleAuth({
  // When the user goes to /api/auth/login, request your custom API audience
  login: (req, res) =>
    handleLogin(req, res, {
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email', // add other scopes here if you need them
      },
    }),

  // The default callback just finishes the login
  callback: (req, res) => handleCallback(req, res),

  // You can leave logout alone
  logout: (req, res) => handleLogout(req, res),
});
