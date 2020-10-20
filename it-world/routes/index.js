var express = require('express');
var router = express.Router();
const path = require('path')
const {fileGetter} = require('../nodeSrc/file_geter')

/* GET home page. */


router.get(RegExp(/^\/.*/),function(req, res,) {
  fileGetter(res,path.join(__dirname,'../index.html'),'text/html').pipe(res)

});

module.exports = router;
