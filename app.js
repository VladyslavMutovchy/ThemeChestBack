import dotenv from 'dotenv';
import finalCallback from 'finalhandler';
import Router from 'router';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import http from 'http';
import fs from 'fs';

import { getDirName } from './lib/utils/functions.js';
import dbClass from './lib/common/DbService.js';
import HelperService from './lib/common/HelperService.js';
import Responses from './lib/common/Responses.js';
import authApi from './lib/api/AuthApi.js';

const __dirname = getDirName(import.meta.url);
dotenv.config({ path: `${__dirname}/.env` });

//Db creation
global.dbConnection = new dbClass();
//global helpers class
global.helpers = HelperService;
global.responses = Responses;

// //initialize router
const router = Router();

// use some middleware and compress all outgoing responses
router.use(compression());
// add a body parsing middleware to our API
router.use(bodyParser.json());
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));
//add cors
router.use(cors());

router.route('/public/*').get((req, res) => {
  let filePath = path.join(__dirname, req.url);

  if (filePath.includes('%20')) {
    filePath = decodeURI(filePath);
  }

  if (fs.existsSync(filePath)) {
    res.statusCode = 200;
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    return;
  }

  global.responses.errorResponse(res, 'Not found');
});

//Enable api
router.use(authApi);

const port = process.env.PORT || 3002;
//initialize server and add router to it

http.createServer(async (req, res) => {
  router(req, res, finalCallback(req, res))
}).listen(port, (err) => {
  err ? console.log("Error occur :" + err) : console.log(`server is listening on ${port}`);
});
