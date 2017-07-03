'use strict';

/**
 * Created by xuchao on 2017/6/21.
 */
const MyRequest = require('./http');
const Rx = require('rxjs/Rx');

MyRequest.getConfig = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/getConfig', {activityId}, 'get');
};

MyRequest.addPv = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/addPV', {activityId}, 'get');
};

MyRequest.getVoteInfo = (activityId) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/voteInfo', {activityId}, 'get');
};

MyRequest.getMyItem = (activityId, openid) => {
  return Rx.Observable.if(
    () => { return null == openid },
    Rx.Observable.of({code: -1}),
    MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/query', {activityId, openid}, 'post')
  );
};

MyRequest.queryList = (activityId, pageNum, pageSize, orderBy, orderType) => {
  return MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/query', {activityId, pageNum, pageSize, orderBy, orderType}, 'post');
};

MyRequest.getShareItem = (activityId, id) => {
  return Rx.Observable.if(
    () => { return null == id },
    Rx.Observable.of({code: -1}),
    MyRequest.requestObservable('http://activity.wechat.cloudatum.com/activity/vote/query', {activityId, id}, 'post')
  );
};

module.exports = MyRequest;
