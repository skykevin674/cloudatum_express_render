'use strict';

/**
 * Created by xuchao on 2016/11/14.
 */
const express = require('express');
const router = express.Router();

const Rx = require('rxjs/Rx');
const render = require('../util/render.util');

// import VoteRequest from '../http/http.vote';
const BargainRequest = require('../http/http.bargain');


const trimQuery = (query) => {
  for (let i in query) {
    query[i] = query[i].replace('\/', '');
  }
  return query;
};

const prefetchBargain = (req, res) => {
  let map = {}, query = trimQuery(req.query);
  Rx.Observable.zip(
    BargainRequest.getWxConfig(query.originalid, `${req.protocol}://${req.hostname}${req.path}`),
    BargainRequest.getWxConfig(query.originalid, `${req.protocol}://${req.hostname}${req.originalUrl}`),
    BargainRequest.getFansInfo(query.openid || query.auth2Id, query.originalid, query.scope, query.auth2Token, query.auth2UnionId, query.type),
    BargainRequest.getConfig(query.activityId),
    BargainRequest.getProducts(query.activityId),
    // BargainRequest.getMy(query.activityId, query.openid || query.auth2Id, true),
    (wx, bwx, fans, config, products) => {
      map.signUrl = `${req.protocol}://${req.hostname}${req.path}`;
      map.backWx = bwx.data;
      map.wx = wx.data;
      map.fans = fans.data;
      map.config = config.data;
      map.products = products.data;
      if(map.products.code === 0 && map.products.body) {
        for (let item of map.products.body) {
          item.successReply = '';
          item.unnewReply = '';
        }
      }
      map.shareNumber = query.share;
      // map.my = my.data
    }
  ).subscribe(
    () => render.render(req, res, map), err => {
      console.log(err);
    }
  );
};

router.get('*', function (req, res) {
  if(!render.checkAuth(req, res)) return;
  render.send(req, res, prefetchBargain);
});

module.exports = router;
