declare module 'express' {
  interface Request {
    authMetadata?: AuthMetadata;
  }
}

import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from './middleware/error';
import { login, logout } from './handlers/auth';
import { getLoansByUserEmail, getLoans, deleteLoan, getExpiredLoans } from './handlers/loans';
import { admin, AuthMetadata, checkRefreshTokenCookie, postVerification, staff, superAdmin } from './middleware/auth';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './logger';
import { v4 as uuidv4 } from 'uuid';
import { rateLimiter } from './middleware/rateLimiter';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT;

app.use(cors());
app.use(rateLimiter);
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  let requestId = uuidv4();
  logger.info(`Processing request: [${requestId}] ${req.method} ${req.url} ${JSON.stringify(req.query)}`);
  res.on('finish', () => logger.info(`Processed request: ${requestId} STATUS:${res.statusCode}`));
  next();
});

app.post('/login', login);

app.get('/logout', checkRefreshTokenCookie, superAdmin, admin, staff, logout);

app.get('/loans', checkRefreshTokenCookie, superAdmin, admin, staff, postVerification, getLoans);

app.get('/loans/:userEmail/get', checkRefreshTokenCookie, superAdmin, admin, staff, postVerification, getLoansByUserEmail);

app.get('/loans/expired', checkRefreshTokenCookie, superAdmin, admin, staff, postVerification, getExpiredLoans);

app.delete('/loan/:loanId/delete', checkRefreshTokenCookie, superAdmin, postVerification, deleteLoan);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening at https://localhost:${port}`);
});

export default app;
