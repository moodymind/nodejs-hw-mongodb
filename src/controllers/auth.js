import { THIRTY_DAYS } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  // console.log('Session ID:', session._id);

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.json({
    status: 200,
    message: 'Successfully logged in user',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookie.sessionId) {
    await logoutUser(req.cookie.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUserSessionController = async (req, res) => {
  // console.log('Cookies:', req.cookies);

  // console.log('Session ID:', req.cookies.sessionId);
  // console.log('Refresh Token:', req.cookies.refreshToken);

  const session = await refreshUserSession({
    sessionId: req.cookies['sessionId'],
    refreshToken: req.cookies['refreshToken'],
  });

  setupSession(session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    date: {
      accessToken: session.accessToken,
    },
  });
};
