'use strict';

/**
 * Created by xuchao on 2017/4/12.
 */
const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

function getValidNodeCount (list, validFilter) {
  let len = 0;
  for (let n in list) {
    const img = list[n];
    if (validFilter(img)) {
      len++;
    }
  }
  return len;
}
function isBgValid (node) {
  return node.attribs && node.attribs.style && node.attribs.style.indexOf('background-image') >= 0;
}
function isImgValid (img) {
  return img.attribs && img.attribs['data-src'];
}
function getImgUrl (node) {
  return node.attribs['data-src'];
}
function getBgUrl (node) {
  return node.attribs.style.replace(/.*background-image:\s*url\((.*)\);.*/, '$1') + '&wx_fmt=gif';
}
function download (list, validFilter, getUrl, onSuccess, onComplete) {
  for (let n in list) {
    const node = list[n];
    if (validFilter(node)) {
      const url = getUrl(node);
      request.get({url: url, encoding: null}, (error, response, b) => {
        if (!error && response.statusCode == 200) {
          const prefix = 'data:' + response.headers['content-type'] + ';base64,';
          let base64 = prefix + new Buffer(b, 'binary').toString('base64');
          onSuccess(node, base64, onComplete);
        } else {
          console.log(error);
        }
      });
    }
  }
}
function start (url, onComplete) {
  const $ = cheerio.load(url);
  let i = 0;
  const imgList = $('img'), bgList = $('blockquote');
  const count = getValidNodeCount(imgList, isImgValid) + getValidNodeCount(bgList, isBgValid);
  if (count <= 0) {
    onComplete($.html());
    return;
  }
  download(bgList, isBgValid, getBgUrl, (node, base64, onComplete) => {
    node.attribs.style = node.attribs.style.replace(/(.*background-image:\s*url\()(.*)(\);.*)/, '$1' + base64 + '$3');
    i++;
    if (i >= count) {
      onComplete($.html());
    }
  }, onComplete);
  download(imgList, isImgValid, getImgUrl, (node, base64, onComplete) => {
    node.attribs.src = base64;
    i++;
    if (i >= count) {
      onComplete($.html());
    }
  }, onComplete);
}

router.get('/test', function (req, res) {
  const $ = cheerio.load(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>123</body>
    </html>
  `);
  const json = JSON.stringify({test: 1, name: 'test'});
  const data = $('<script></script>').prepend(`
    var json = ${json};
    console.log(json);
  `);
  data.appendTo($('body'));
  res.set('Content-Type', 'text/html; charset=UTF-8');
  res.status(200);
  res.send($.html());
});

router.get('/getFuckingWxPic', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  if (req.query.url) {
    request({url: decodeURIComponent(req.query.url), encoding: null}, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        // res.header('content-type', response.headers['content-type']);
        const prefix = 'data:' + response.headers['content-type'] + ';base64,';
        let base64 = prefix + new Buffer(body, 'binary').toString('base64');
        res.send({code: 0, data: base64});
        // console.log(body);
      }else {
        res.send({code: -1});
      }
    });
  } else {
    res.send({code: -122});
  }
});

router.get('/time', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  const date = new Date();
  res.send({code: 0, day: date.getDate(), month: date.getMonth()+1});
});

router.get('', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  if (req.query.url) {
    request(req.query.url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const target = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        start(target, text => {
          res.send({code: 0, body: text});
        });
      } else {
        res.send({code: -101});
      }
    });
  } else {
    res.send({code: -122});
  }

});

module.exports = router;
