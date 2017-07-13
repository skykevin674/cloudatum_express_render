'use strict';

/**
 * Created by xuchao on 2017/6/29.
 */
const cheerio = require('cheerio');
const Request = require('../http/http');
const path = require('path');
const Rx = require('rxjs/Rx');
const file = require('fs');

module.exports = (function () {

  const getIndexPath = (req) => {
    // return path.join(__dirname, '../..', req.path, 'index.html');
    return path.join(__dirname, '../..', 'activity', req.path, 'index.html');
  };

  const render = (req, res, data) => {
    const indexPath = getIndexPath(req);
    const $ = cheerio.load(file.readFileSync(indexPath).toString());
    const json = JSON.stringify(data);
    const tag = $('<script></script>').prepend(`
      var json = ${json};
    `);
    tag.appendTo($('body'));
    res.status(200);
    res.send($.html());
  };

  const checkAuth = (req, res) => {
    const scope = req.query['scope'], authId = req.query['auth2Id'];
    let originalid;
    switch (req.query['type']){
      case '1':
        originalid = req.query['originalid'];
        break;
      case '2':
        originalid = 'gh_64e30d75c9ce';
        break;
      default:
        return true;
    }
    if(scope && !authId) {
      Request.getAuthUrl(originalid, `${req.protocol}://${req.hostname}${req.originalUrl}`, scope).subscribe(data => {
        if(data.data.code == 0) {
          res.redirect(data.data.msg);
        } else {
          res.status(200);
          res.send('授权失败，请联系管理员');
        }
      });
      return false;
    }
    return true;
  };

  const send = (req, res, callback) => {
    const indexPath = getIndexPath(req);
    res.set('Content-Type', 'text/html; charset=UTF-8');
    if (file.existsSync(indexPath)) {
      callback(req, res);
      return;
    }
    res.status(404);
    res.send('页面不存在');
  };

  return {send, render, checkAuth};
})();
