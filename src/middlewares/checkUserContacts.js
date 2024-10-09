import { ContactsCollection } from '../db/models/contact.js';
import createHttpError from 'http-errors';

export const checkUserContacts = async (req, res, next) => {
  const { user } = req;
  const { contactId } = req.params;

  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId: user._id,
  });

  if (!contact) {
    throw next(createHttpError(404, 'Contact not found'));
  }

  next();
};
