/* eslint-disable no-undef */
import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection();
  return contacts;
};

export const getContactById = async () => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};
