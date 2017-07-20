'use strict';

/**
 * Created by xuchao on 2017/6/29.
 */
const MyRequest = require('./http');
const Rx = require('rxjs/Rx');

MyRequest.getProducts = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/productList', {activityId},
    'get');
};

MyRequest.getMy = (activityId, openid, isRank) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/personInfo',
    {activityId, openid, isRank}, 'get');
};

MyRequest.getConfig = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/getBargainInfo',
    {activityId}, 'get');
};


module.exports = MyRequest;
