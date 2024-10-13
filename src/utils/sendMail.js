import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';
import env from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};
