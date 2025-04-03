declare module 'express' {
  interface Request {
    authMetadata?: AuthMetadata;
  }
}

import express, { Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from './middleware/error';
import { login, logout } from './handlers/auth';
import { getLoansByUserEmail, getLoans, deleteLoan, getExpiredLoans } from './handlers/loans';
import { admin, AuthMetadata, checkRefreshTokenCookie, staff, superAdmin } from './middleware/auth';
import cors from 'cors';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors());

app.post('/login', login);

app.get('/logout', checkRefreshTokenCookie, superAdmin, admin, staff, logout);

app.get('/loans', checkRefreshTokenCookie, superAdmin, admin, staff, getLoans);

app.get('/loans/:userEmail/get', checkRefreshTokenCookie, superAdmin, admin, staff, getLoansByUserEmail);

app.get('/loans/expired', checkRefreshTokenCookie, superAdmin, admin, staff, getExpiredLoans);

app.delete('/loan/:loanId/delete', checkRefreshTokenCookie, superAdmin, deleteLoan);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening at https://localhost:${port}`);
});

export default app;
