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




global.dbConnection = new dbClass();
global.helpers = HelperService;
global.responses = Responses;

const router = Router();

router.use(compression());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
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

router.use(authApi);

const port = process.env.PORT || 3002;

http.createServer(async (req, res) => {
  router(req, res, finalCallback(req, res))
}).listen(port, (err) => {
  err ? console.log("Error occur :" + err) : console.log(`server is listening on ${port}`);
});
