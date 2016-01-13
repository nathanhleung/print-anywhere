'use strict';

let ipp = require('ipp')
let fs = require('fs');
let path = require('path');

let baseDir = require('../config/config').baseDir;

let printer = require('../config/printer')
let printerConnection = ipp.Printer(printer.uri);

function printFile(body, cb) {
  fs.readFile(path.join(baseDir, 'uploads', body.file + '.ps'), (err, data) => {
    if (err) {
      return res.send(err);
    }

    let msg = {
      "operation-attributes-tag": {
        "requesting-user-name": "printerService",
        "job-name": body.file,
        "document-format": "application/postscript",
        "ipp-attribute-fidelity": true
      },
      /** 
       * Duplex doesn't work with IPP, see 
       * https://www.interact-sw.co.uk/iangblog/2005/04/29/psduplex instead
       */
      "job-attributes-tag": {
        /*
        copies: 1,
        sides: "two-sided-long-edge"
        */
      },
      data: data,
      version: "1.1"
    };

    
    printerConnection.execute("Print-Job", msg, (err, response) => {
      cb(err, response);
    });
  });
}

/**
 * @todo
 * Figure out how to apply options to PS file
 */
function applyOptions(filePath, options) {
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
      res.redirect('/success?name=' + req.file.filename);
    });
  });
}

let printController = {
  postPrint: (req, res) => {
    printFile(req.body, (err, response) => {
      if (err) {
        res.send(err);
      }
      console.log(response);
      res.redirect('/success?name=' + req.body.file)
    });
  },
  getPrinter: (req, res) => {
    var msg = {
      "operation-attributes-tag": {
        "requesting-user-name": "printerService"
      },
      version: "1.1"
    };
    printerConnection.execute("Get-Printer-Attributes", msg, function(err, response){
      res.render('printer', {
        title: 'Printer Attributes',
        attributes: response['printer-attributes-tag']
      });
    });
  }
};

module.exports = printController;
