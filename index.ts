import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from './middleware/error';
import { login } from './handlers/auth';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.post('/login', login);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening at https://localhost:${port}`);
});
