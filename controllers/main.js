'use strict';

let fs = require('fs');
let path = require('path');
let exec = require('child_process').exec;

let baseDir = require('../config/config').baseDir;

let mainController = {
  index: (req, res) => {
    res.render('index', {
      title: 'PrintAnywhere'
    });
  },
  getFile: (req, res) => {
    res.render('file', {
      title: 'File Data',
      file: req.query.name
    });
  },
  getSuccess: (req, res) => {
    res.render('success', {
      title: 'Print Success',
      file: req.query.name
    })
  },
  postUpload: (req, res) => {
    let filePath = path.join(baseDir, 'uploads', req.file.filename);
    let cmd = 'pdf2ps \'' + filePath + '\' \'' + filePath + '.ps\'';
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return res.send(err);
      }
      if (stderr) {
        return res.send(stderr)
      }
      // This is also in printController in applyOptions() => need to figure that out
      // For now, everything defaults to duplex
      fs.readFile(filePath + '.ps', (err, data) => {
        if (err) {
          return res.send(err);
        }
        // see https://www.interact-sw.co.uk/iangblog/2005/04/29/psduplex
        let duplexCode = "<< /Duplex true >> setpagedevice\n";
        let firstPageIndex = data.indexOf('%%Page:');
        let updatedData = data.slice(0, firstPageIndex) + duplexCode + data.slice(firstPageIndex)
        fs.writeFile(filePath + '.ps', updatedData, (err, data) => {
          if (err) {
            return res.send(err);
          }
          res.redirect('/file?name=' + req.file.filename);
        });
      });
      //
    });
  }
};

module.exports = mainController;
