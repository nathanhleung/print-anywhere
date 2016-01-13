'use strict';

let express = require('express');
let multer = require('multer');
let bodyParser = require('body-parser');
let logger = require('morgan');
let path = require('path');
let ipp = require('ipp');
let fs = require('fs');

let app = express();
let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'))
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
});

let printer = require('./config/printer')
let printerConnection = ipp.Printer(printer.uri);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  res.locals.basedir = path.join(__dirname, 'views');
  next();
});

let mainController = require('./controllers/main');
let printController = require('./controllers/print');

app.get('/', mainController.index);
app.get('/file', mainController.getFile);
app.get('/success', mainController.getSuccess);
app.post('/upload', upload.single('pdf'), mainController.postUpload);

app.get('/printer', printController.getPrinter);
app.post('/print', printController.postPrint);

app.listen(app.get('port'), () => {
  console.log('App listening on port ' + app.get('port') + '!');
});
