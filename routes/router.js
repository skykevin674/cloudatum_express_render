'use strict';

/**
 * Created by xuchao on 2016/11/14.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

router.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../..', 'activity') + req.originalUrl + 'index.html');
  // res.create
});

module.exports = router;
