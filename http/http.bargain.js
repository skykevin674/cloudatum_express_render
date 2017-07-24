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

MyRequest.getMy = (activityId, productId, openid, isRank) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/personInfo',
    {activityId, openid, isRank, productId}, 'get');
};

MyRequest.getShare = (activityId, share, isRank) => {
  if(share && share.indexOf('_') > 0) {
    return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/personInfo',
        {activityId, number: share.split('_')[1], isRank, productId: share.split('_')[0]}, 'get');
  }else {
    return Rx.Observable.of({code : -1});
  }

};

MyRequest.queryMyList = (products, openid) => {
  let tmp = [];
  for(let item of products){
    tmp.push(MyRequest.getMy(item.activityId, item.id, openid, true));
  }
  return Rx.Observable.forkJoin(...tmp);
};

MyRequest.getConfig = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/bargain/getBargainInfo',
    {activityId}, 'get');
};


module.exports = MyRequest;
