'use strict';

/**
 * Created by xuchao on 2016/11/14.
 */
const express = require('express');
const router = express.Router();

const Rx = require('rxjs/Rx');
const render = require('../util/render.util');

// import VoteRequest from '../http/http.vote';
const VoteRequest = require('../http/http.vote');


const trimQuery = (query) => {
  for (let i in query) {
    query[i] = query[i].replace('\/', '');
  }
  return query;
};

const prefetchVote = (req, res) => {
  let map = {}, query = trimQuery(req.query);
  Rx.Observable.zip(
    VoteRequest.getWxConfig(query.originalid, `${req.protocol}://${req.hostname}${req.path}`),
    VoteRequest.getFansInfo(query.openid || query.auth2Id, query.originalid, query.scope, query.auth2Token, query.auth2UnionId, query.type),
    VoteRequest.getConfig(query.activityId),
    VoteRequest.addPv(query.activityId),
    VoteRequest.getVoteInfo(query.activityId),
    VoteRequest.getMyItem(query.activityId, query.openid || query.auth2Id),
    // VoteRequest.queryList(query.activityId, 1, 10, 'currentCount', 'desc'),
    VoteRequest.getShareItem(query.activityId, query.id),
    (wx, fans, config, pv, info, my, item) => {
      map.signUrl = `${req.protocol}://${req.hostname}${req.path}`;
      map.wx = wx.data;
      map.fans = fans.data;
      map.config = config.data;
      map.info = info.data;
      map.my = (my.data && my.data.code == 0 && my.data.body.length > 0) ? my.data.body[0] : null;
      map.item = (item.data && item.data.code == 0 && item.data.body.length > 0) ? item.data.body[0] : null;
    }
  ).subscribe(
    () => render.render(req, res, map), err => {
      console.log(err);
    }
  );
};

router.get('*', function (req, res) {
  if(!render.checkAuth(req, res)) return;
  render.send(req, res, prefetchVote);
});

module.exports = router;
