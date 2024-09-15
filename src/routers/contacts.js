import { Router } from 'express';
import {
  getContactsController,
  getContactController,
} from './controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const contactsRouter = Router();

contactsRouter.get('/contacts', ctrlWrapper(getContactsController()));

contactsRouter.get('/contacts/:contactId', ctrlWrapper(getContactController()));

export default contactsRouter;
