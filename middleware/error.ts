import { NextFunction, Request, Response } from 'express';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.message);
  console.log(res.statusCode);

  if (500 > res.statusCode && res.statusCode > 0) {
    res.status(res.statusCode).json({ error: err.message, });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default errorHandler;
