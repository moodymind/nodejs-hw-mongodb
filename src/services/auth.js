import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import {
  FIFTEEN_MINUTES,
  SMTP,
  TEMPLATES_DIR,
  THIRTY_DAYS,
} from '../constants/index.js';
import { SessionCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import env from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

export const registerUser = async (registrationData) => {
  const user = await UsersCollection.findOne({ email: registrationData.email });

  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(registrationData.password, 10);

  return await UsersCollection.create({
    ...registrationData,
    password: encryptedPassword,
  });
};

export const loginUser = async (loginData) => {
  const user = await UsersCollection.findOne({
    email: loginData.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isEqual = await bcrypt.compare(loginData.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Not authorized');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  const session = await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return session;
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token is expired!');
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({ _id: session._id, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (resetPasswordData) => {
  let entries;

  try {
    entries = jwt.verify(resetPasswordData.token, env('JWT_SECRET'));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createHttpError(401, 'Token is expired.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createHttpError(401, 'Invalid token.');
    }
    throw error;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(resetPasswordData.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
