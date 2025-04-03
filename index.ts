import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from './middleware/error';
import { login, logout } from './handlers/auth';
import { getLoansByUserEmail, getLoans, deleteLoan, getExpiredLoans } from './handlers/loans';
import { superAdmin } from './middleware/auth';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.post('/login', login);

app.get('/logout', logout);

app.get('/loans', getLoans);

app.get('/loans/:userEmail/get', getLoansByUserEmail);

app.get('/loans/expired', getExpiredLoans);

app.delete('/loan/:loanId/delete', deleteLoan);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening at https://localhost:${port}`);
});
