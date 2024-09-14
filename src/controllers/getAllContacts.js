import { getAllContacts } from '../services/contacts.js';

export const getContacts = async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.status(200).json({
      message: 'Successfully found contacts',
      data: contacts,
    });
  } catch (e) {
    res.status(500).json({
      message: 'Failed to find contacts',
      error: e.message,
    });
  }
};
