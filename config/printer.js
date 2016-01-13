'use strict';

let printer = {
  uri: process.env.PRINTER_URI || "http://192.168.1.4:631/ipp"
};

module.exports = printer;
