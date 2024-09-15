import { HttpError } from 'http-errors';

export const errorHandler = async (error, req, res, next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      data: error,
    });
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: error.message,
  });
};
