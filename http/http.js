'use strict';

/**
 * Created by xuchao on 2017/6/21.
 */
const axios = require('axios');
const Rx = require('rxjs/Rx');
require('rxjs/add/observable/of');
require('rxjs/add/observable/if');
function MyRequest () {
  const requestObservable = (url, data, method) => {
    let promise;
    switch (method) {
      case 'get':
        promise = axios.get(url, {params: data});
        break;
      case 'post':
        promise = axios.post(url, data);
        break;
    }
    return Rx.Observable.fromPromise(promise).catch(() => {
      return Rx.Observable.of({code: -1, msg: '服务端未知错误'});
    });
  };

  const getWxConfig = (originalid, url) => {
    return requestObservable('http://base.wechat.cloudatum.com/api/jsConfig', {originalid, url}, 'get');
  };

  const getAuthUrl = (originalid, toUrl, scope) => {
    return requestObservable('http://base.wechat.cloudatum.com/api/getOauth2Url', {originalid, toUrl, scope}, 'get');
  };

  const getFansInfoByToken = (accessToken, openid, originalid) => {
    return requestObservable('http://base.wechat.cloudatum.com/api/getInfoByAccessToken',
      {originalid, accessToken, openid}, 'get');
  };

  const getFansInfo = (openid, originalId, scope, token) => {
    return Rx.Observable.if(() => {
        return scope == 'snsapi_userinfo' && token;
      },
      Rx.Observable.concat(
        requestObservable('http://base.wechat.cloudatum.com/api/getFansInfo',
          {originalid: originalId, openid: openid, forceUpdate: 0}, 'get'),
        getFansInfoByToken(token, openid, originalId)
      ).first(data => data.data.code == 0),
      Rx.Observable.if(
        () => {
          return null == openid;
        },
        Rx.Observable.of({code: -1}),
        Rx.Observable.concat(
          requestObservable('http://base.wechat.cloudatum.com/api/getFansInfo',
            {originalid: originalId, openid: openid, forceUpdate: 0}, 'get'),
          requestObservable('http://base.wechat.cloudatum.com/api/getFansInfo',
            {originalid: originalId, openid: openid, forceUpdate: 1}, 'get')
        ).first(data => (data.data.code == 0 && data.data.body.nickname) || data.data.code == -1)
      ));
  };

  return {requestObservable, getWxConfig, getFansInfo, getAuthUrl};
}

module.exports = MyRequest();
