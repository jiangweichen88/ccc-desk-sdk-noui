import { cccDesk_CallCenter } from './index.js'
var SoftPhone = {
  _websocket: null,
  _callid: null,
  _media_ip: null,
  _media_port: null,
  _sip_id: null,
  _sip_pwd: null,
  _wsurl: '',
  _uninit: false,
  _websocket_ocx: null,
  _eventJson: null,
  _initType: null,
  _registered: false,
  check: function () {
    return true
  },
  /**
   * 初始化控件
   * @param media_ip
   * @param media_port
   * @param sip_id
   * @param sip_pwd
   * @returns {cccDesk_SoftPhone}
   */
  init: function (media_ip, media_port, sip_id, sip_pwd, eventJson, initType) {
    console.log(media_ip, media_port, sip_id, sip_pwd, eventJson, initType)
    SoftPhone.log('cccDesk_SoftPhone:初始化连接')
    if ('https:' == document.location.protocol) {
      // SoftPhone._wsurl = "wss://localhost.acloudcc.com:19996";
      SoftPhone._wsurl = 'ws://127.0.0.1:19191'
    } else {
      SoftPhone._wsurl = 'ws://127.0.0.1:19191'
    }
    SoftPhone.log('cccDesk_SoftPhone:连接地址:' + this._wsurl)
    if (media_ip) {
      SoftPhone._media_ip = media_ip
    }
    if (media_port) {
      SoftPhone._media_port = media_port
    }
    if (sip_id) {
      SoftPhone._sip_id = sip_id
    }
    if (sip_pwd) {
      SoftPhone._sip_pwd = sip_pwd
    }
    this._eventJson = eventJson || {}
    this._initType = initType || 'logon'
    if ('WebSocket' in window) {
      SoftPhone._websocket = new WebSocket(this._wsurl)
      SoftPhone._websocket.onopen = this.onopen
      SoftPhone._websocket.onmessage = this.onmessage
      SoftPhone._websocket.onclose = this.onclose
      SoftPhone._websocket.onerror = this.onerror
    } else {
      // cccDesk_CallCenter.selfChecking({
      //   from: 'cccDesk_SoftPhone',
      //   msg: '浏览器不支持WebSocket，也不支持BrowserSDK插件',
      // })
      // alert('您的浏览器不支持websocket')
    }
    SoftPhone._uninit = false
    // cccDesk_CallCenter.selfChecking({
    //   from: 'cccDesk_SoftPhone',
    //   msg: '初始化软电话，连接地址为：' + this._wsurl,
    // })
    return this
  },
  /**
   * 卸载控件
   * @constructor
   */
  UnInitialize: function (callback) {
    SoftPhone.log('cccDesk_SoftPhone:卸载控件')
    SoftPhone.send({
      aicc: 'message',
      request: 'unInitialize'
    })
    SoftPhone._uninit = true
    SoftPhone._registered = false
    if (SoftPhone._websocket_ocx) {
      //如果调用了控件的WS对象，移除
      try {
        SoftPhone._websocket.close()
        SoftPhone._websocket_ocx.close()
        SoftPhone._websocket_ocx.UnInitialize()
        // cccDesk_CallCenter.selfChecking({
        //   from: 'cccDesk_SoftPhone',
        //   msg: '卸载软电话，关闭软电话WebSocket连接',
        // })
      } catch (e) {}
    }
  },
  /**
   * 获取版本号
   */
  version: function () {
    SoftPhone.send({
      aicc: 'message',
      request: 'version'
    })
  },
  /**
   * 登录话机功能
   * @constructor
   */
  Login: function (media_ip, media_port, sip_id, sip_pwd) {
    if (media_ip) {
      SoftPhone._media_ip = media_ip
    }
    if (media_port) {
      SoftPhone._media_port = media_port
    }
    if (sip_id) {
      SoftPhone._sip_id = sip_id
    }
    if (sip_pwd) {
      SoftPhone._sip_pwd = sip_pwd
    }
    if (!SoftPhone._media_ip) {
      return false
    }
    if (!SoftPhone._media_ip) {
      return false
    }
    if (!SoftPhone._sip_id) {
      return false
    }
    if (!SoftPhone._media_ip) {
      return false
    }
    SoftPhone.log('cccDesk_SoftPhone:登录话机')
    SoftPhone.send({
      aicc: 'message',
      request: 'register',
      body: {
        srvAddr: SoftPhone._media_ip,
        srvPort: SoftPhone._media_port,
        accId: SoftPhone._sip_id,
        accPwd: SoftPhone._sip_pwd
      }
    })
    // cccDesk_CallCenter.selfChecking({ from: 'cccDesk_SoftPhone', msg: '登录软电话' })
    if (SoftPhone._websocket != null && SoftPhone.readyState == 1) {
      return true
    } else {
      return false
    }
  },
  /**
   * 登出话机
   * @constructor
   */
  Logout: function () {
    SoftPhone.log('cccDesk_SoftPhone:登出话机')
    SoftPhone.send({
      aicc: 'message',
      request: 'unRegister'
    })
    if (SoftPhone._websocket_ocx) {
      try {
        SoftPhone._websocket_ocx.UnInitialize()
        // cccDesk_CallCenter.selfChecking({
        //   from: 'cccDesk_SoftPhone',
        //   msg: '登出软电话，卸载话机',
        // })
      } catch (e) {}
    }
  },
  /**
   * 外呼
   * @param callType
   * @param called
   * @constructor
   */
  MakeCall: function (called) {
    SoftPhone.log('cccDesk_SoftPhone:外呼')
    SoftPhone.send({
      aicc: 'message',
      request: 'makeCall',
      body: {
        caller: '',
        called: called
      }
    })
  },
  /**
   * 接听
   * @constructor
   */
  AcceptCall: function () {
    SoftPhone.log('cccDesk_SoftPhone:接听')
    SoftPhone.send({
      aicc: 'message',
      request: 'answer',
      body: {
        callid: SoftPhone._callid
      }
    })
  },
  /**
   * 挂机
   * @constructor
   */
  ReleaseCall: function () {
    SoftPhone.log('cccDesk_SoftPhone:挂机')
    SoftPhone.send({
      aicc: 'message',
      request: 'reject',
      body: {
        callid: SoftPhone._callid,
        reason: 1
      }
    })
  },
  /**
   * 静音
   * @constructor
   */
  Mute: function () {
    SoftPhone.log('cccDesk_SoftPhone:静音')
    SoftPhone.send({
      aicc: 'message',
      request: 'mute',
      body: {
        callid: SoftPhone._callid,
        reason: 1
      }
    })
  },
  /**
   * 取消静音
   * @constructor
   */
  UnMute: function () {
    SoftPhone.log('cccDesk_SoftPhone:取消静音')
    SoftPhone.send({
      aicc: 'message',
      request: 'unmute',
      body: {
        callid: SoftPhone._callid,
        reason: 1
      }
    })
  },
  /**
   * 按键
   * @constructor
   */
  SendDTMF: function (key) {
    SoftPhone.log('cccDesk_SoftPhone:按键')
    SoftPhone.send({
      aicc: 'message',
      request: 'sendDTMF',
      body: {
        callid: SoftPhone._callid,
        dtmf: key
      }
    })
  },
  /**
   * 设置编码
   * @param type
   * @param enable
   */
  setCodecEnabled: function (type, enable) {
    this.log('cccDesk_SoftPhone:设置编码')
    SoftPhone.send({
      aicc: 'message',
      request: 'setCodecEnabled',
      body: {
        type: type,
        enable: enable
      }
    })
  },
  /**
   * 重连
   */
  reconnection: function () {},
  /**
   * 恢复ccs通信
   */
  continueLogin: function () {
    var json = this._eventJson
    var type = this._initType
    SoftPhone._registered = true
    if (typeof SoftPhone.onconnection_fun == 'function') {
      SoftPhone.onconnection_fun()
    }
    // console.log(cccDesk_CallCenterStatus, 'cccDesk_CallCenterStatus_')
    // type === 'logon'
    //   ? cccDesk_CallCenterStatus.login()
    //   : cccDesk_CallCenterStatus.reconnection()
    // var eventFun = cccDesk_CallCenter[type + '_event']
    // var events = cccDesk_CallCenter._events[type] //是否有注册事件
    // var transactionListener = cccDesk_CallCenter[type + '_transaction']
    if (typeof eventFun == 'function') {
      //是否有外部注册回调函数
      try {
        eventFun(json)
      } catch (ex) {
        cccDesk_CallCenter.log('调用外部注册事件异常，查看详情需要开启调试模式')
        cccDesk_CallCenter.log(ex)
      }
    }

    if (typeof events != 'undefined') {
      for (var key in events) {
        var fun = events[key]
        if (typeof fun == 'function') {
          try {
            fun(json)
          } catch (ex) {
            cccDesk_CallCenter.log('调用外部注册事件异常，查看详情需要开启调试模式')
            cccDesk_CallCenter.log(ex)
          }
        }
      }
    }
    if (typeof transactionListener === 'function') {
      try {
        transactionListener(json)
      } catch (e) {
        cccDesk_CallCenter.log('内部注册事件执行失败', e)
      }
    }
    cccDesk_CallCenter.executeMessage()
  },
  /**
   * 连接建立
   */
  onopen: function () {
    SoftPhone.log('cccDesk_SoftPhone消息：建立连接')
    SoftPhone.send({
      aicc: 'message',
      request: 'initialize'
    })
    return this
  },
  /**
   * 连接错误
   */
  onerror: function () {
    SoftPhone.log('cccDesk_SoftPhone消息：连接错误')
    SoftPhone.UnInitialize()
    // cccDesk_CallCenter.selfChecking({
    //   from: 'cccDesk_SoftPhone',
    //   msg: '连接软电话WebSocket错误，卸载软电话',
    // })
    return this
  },
  /**
   * 连接关闭
   */
  onclose: function () {
    SoftPhone.log('cccDesk_SoftPhone消息：连接关闭')
    // cccDesk_CallCenter.selfChecking({
    //   from: 'cccDesk_SoftPhone',
    //   msg: '软电话WebSocket关闭',
    // })
    if (typeof SoftPhone.onclose_event == 'function') {
      SoftPhone.onclose_event()
    }
    if (!SoftPhone._uninit) {
      cccDesk_CallCenter.log('SipPhone初始化失败')
      // cccDesk_CallCenter.selfChecking({
      //   from: 'cccDesk_SoftPhone',
      //   msg: '软电话WebSocket异常关闭，尝试重连',
      // })
    }
    return this
  },
  /**
   * 获取当前通话的callid
   */
  getCurrentCall: function () {
    SoftPhone.send({
      aicc: 'message',
      request: 'getCurrentCall',
      body: {
        callid: SoftPhone._callid
      }
    })
  },
  /**
   * 连接消息
   */
  onmessage: function (data) {
    SoftPhone.log('cccDesk_SoftPhone消息接收：')
    SoftPhone.log(data.data, '00000000000')
    var json = JSON.parse(data.data)
    console.log(json, '--------aicc')
    switch (json.aicc) {
      case 'event':
        console.log('event1', json.name, '==========json.name')
        switch (json.name) {
          case 'initialize':
            SoftPhone.Login()
            break
          case 'unInitialize':
            break
          case 'register':
            if (typeof SoftPhone['login_event'] == 'function') {
              SoftPhone['login_event'](json.body['return'])
            }
            break
          case 'unRegister':
            break
          case 'makeCall':
            break
          case 'answer':
            break
          case 'rejectCall':
            break
          case 'pauseCall':
            break
          case 'resumeCall':
            break
          case 'hangup':
            if (cccDesk_CallCenter._islogin == false && cccDesk_CallCenter._websocket == null && cccDesk_CallCenter._wsurl != null && cccDesk_CallCenter._wsurl != '') {
              cccDesk_CallCenter.init()
            }
            break

          case 'getCurrentCall':
            if (json.body && json.body.callid != null) {
              SoftPhone._callid = json.body.callid
              SoftPhone.ReleaseCall()
            }
            break
          case 'sendDTMF':
            break
          case 'setCodecEnabled':
            break
          case 'getCodecEnabled':
            break
          case 'version':
            SoftPhone.log(json.body.version)
            break
          case 'mute':
            if (cccDesk_CallCenter._isCallout) {
              if (cccDesk_CallCenter._auto == 1) {
                cccDesk_CallCenterStatus.out_auto_mute()
              } else {
                cccDesk_CallCenterStatus.out_mute()
              }
            } else {
              cccDesk_CallCenterStatus.in_mute()
            }
            break
          case 'unmute':
            if (cccDesk_CallCenter._isCallout) {
              if (cccDesk_CallCenter._auto == 1) {
                cccDesk_CallCenterStatus.out_auto_unmute()
              } else {
                cccDesk_CallCenterStatus.out_unmute()
              }
            } else {
              cccDesk_CallCenterStatus.in_unmute()
            }
            break
          case 'onRegistered':
            // SoftPhone.continueLogin()
            SoftPhone.getCurrentCall()
            break
          case 'onRegisterFailed':
            break
          case 'onUnRegistered':
            break
          case 'onCallIncoming': //接到呼叫
            if (json.body != null && json.body.callid != null) {
              SoftPhone._callid = json.body.callid
            } else {
              SoftPhone.log('cccDesk_SoftPhone:没有找到callid')
            }
            //如果是自动外呼或主动外呼，话机直接接听
            alert($CCCSdkWsInstance.isOutbound)
            if ($CCCSdkWsInstance && $CCCSdkWsInstance.isOutbound) {
              SoftPhone.AcceptCall()
            }
            // if (cccDesk_CallCenter._logintype == 2) {
            //   if (cccDesk_CallCenter.isAuto() || cccDesk_CallCenter.isOutbound()) {
            //     // SoftPhone.AcceptCall()
            //   } else {
            //     // cccDesk_CallCenter.showControl('#SoftPhone_answer')
            //   }
            // }
            if (typeof SoftPhone['OnIncomingCallReceived_event'] == 'function') {
              SoftPhone['OnIncomingCallReceived_event'](json)
            }
            break
          case 'OnCallAlerting':
            if (typeof SoftPhone['OnIncomingCallReceived_event'] == 'function') {
              SoftPhone['OnCallAnswered_event'](json)
            }
            break
          case 'OnCallAnswered':
            if (typeof SoftPhone['OnCallAnswered_event'] == 'function') {
              SoftPhone['OnCallAnswered_event'](json)
            }
            break
          case 'OnMakeCallFailed':
            break
          case 'onCallHanguped':
            /**
             * 20190225 CCS挂机异常时执行webcall挂机处理
             **/
            if ($CCCSdkWsInstance && $CCCSdkWsInstance.isHangupError) {
              // cccDesk_CallCenterStatus.after()
            }
            // if (cccDesk_CallCenter.isCcsCancelMakeCallException() || cccDesk_CallCenter.isCcsAgentConsultBackException()) {
            //   cccDesk_CallCenterStatus.after()
            // }
            break
          case 'OnCallPaused':
            break
          case 'OnCallPausedByRemote':
            break
          case 'OnResumed':
            break
          case 'OnDtmfReceived':
            break
          case 'OnWTSSessionChange':
            if (json.body.sessionState == 'SESSION_LOCK' && cccDesk_CallCenter.getStatus() === 'agentidle') {
              // cccDesk_CallCenter.selfChecking({
              //   from: 'cccDesk_SoftPhone',
              //   msg: '锁屏了，置忙',
              // })
              cccDesk_CallCenter.busy()
            }
            if (typeof SoftPhone['OnWTSSessionChange_event'] == 'function') {
              SoftPhone['OnWTSSessionChange_event'](json)
            }
            break
          default:
            SoftPhone.log('cmdresult未知命令:' + JSON.stringify(json))
        }
        break
      // case "event":
      //   console.log("event2",json.name,"==========json.name")
      //   switch (json.name) {
      //     case "onRegistered":
      //       SoftPhone.continueLogin();
      //       SoftPhone.getCurrentCall();
      //       break;
      //     case  "onRegisterFailed":
      //       break;
      //     case"onUnRegistered":
      //       break;
      //     case "OnIncomingCallReceived"://接到呼叫
      //       if (json.param != null && json.param.callid != null) {
      //         SoftPhone._callid = json.param.callid;
      //       } else {
      //         SoftPhone.log("cccDesk_SoftPhone:没有找到callid");
      //       }
      //       //如果是自动外呼或主动外呼，话机直接接听
      //       if (cccDesk_CallCenter._logintype == 2) {
      //         if (cccDesk_CallCenter.isAuto() || cccDesk_CallCenter.isOutbound()) {
      //           SoftPhone.AcceptCall();
      //         } else {
      //           cccDesk_CallCenter.showControl("#SoftPhone_answer");
      //         }
      //       }
      //       if (typeof (SoftPhone['OnIncomingCallReceived_event']) == 'function') {
      //         SoftPhone['OnIncomingCallReceived_event'](json);
      //       }
      //       break;
      //     case "OnCallAlerting":
      //       if (typeof (SoftPhone['OnIncomingCallReceived_event']) == 'function') {
      //         SoftPhone['OnCallAnswered_event'](json);
      //       }
      //       break;
      //     case "OnCallAnswered":
      //       if (typeof (SoftPhone['OnCallAnswered_event']) == 'function') {
      //         SoftPhone['OnCallAnswered_event'](json);
      //       }
      //       break;
      //     case "OnMakeCallFailed":
      //       break;
      //     case "onCallHanguped":
      //       /**
      //        * 20190225 CCS挂机异常时执行webcall挂机处理
      //        **/
      //       if (cccDesk_CallCenter.isCcsCancelMakeCallException() || cccDesk_CallCenter.isCcsAgentConsultBackException()) {
      //         cccDesk_CallCenterStatus.after();
      //       }
      //       break;
      //     case "OnCallPaused":
      //       break;
      //     case "OnCallPausedByRemote":
      //       break;
      //     case "OnResumed":
      //       break;
      //     case "OnDtmfReceived":
      //       break;
      //     case "OnWTSSessionChange":
      //       if (json.param.sessionState == 'SESSION_LOCK' && cccDesk_CallCenter.getStatus() === "agentidle") {
      //         cccDesk_CallCenter.selfChecking({ from: "cccDesk_SoftPhone", msg: "锁屏了，置忙" });
      //         cccDesk_CallCenter.busy();
      //       }
      //       if (typeof (SoftPhone['OnWTSSessionChange_event']) == 'function') {
      //         SoftPhone['OnWTSSessionChange_event'](json);
      //       }
      //       break;
      //     default :
      //       SoftPhone.log("cccDesk_SoftPhone:cmdresult未知命令:" + JSON.stringify(json));
      //   }
      //   break;
      // default :
      //   SoftPhone.log("cccDesk_SoftPhone:type未知命令:" + JSON.stringify(json));
    }
  },
  /**
   * 发送消息到ws服务器
   */
  send: function (sendObj) {
    try {
      if (SoftPhone._websocket != null) {
        if (('m_readyState' in SoftPhone._websocket ? SoftPhone._websocket.m_readyState : SoftPhone._websocket.readyState) == 1) {
          SoftPhone._websocket.send(JSON.stringify(sendObj))
          if (sendObj.param) {
            sendObj.param.voipId && (sendObj.param.voipId = '*')
            sendObj.param.voipPwd && (sendObj.param.voipPwd = '*')
          }
          cccDesk_CallCenter.log('cccDesk_SoftPhone:发送消息:' + JSON.stringify(sendObj))
        } else {
          switch ('m_readyState' in SoftPhone._websocket ? SoftPhone._websocket.m_readyState : SoftPhone._websocket.readyState) {
            case 0:
              SoftPhone.log('cccDesk_SoftPhone:连接状态[连接尚未建立]')
              break
            case 1:
              SoftPhone.log('cccDesk_SoftPhone:连接状态[WebSocket的链接已经建立]')
              break
            case 2:
              SoftPhone.log('cccDesk_SoftPhone:连接状态[连接正在关闭]')
              break
            case 3:
              SoftPhone.log('cccDesk_SoftPhone:连接状态[连接已经关闭或不可用]')
              // cccDesk_CallCenter.selfChecking({
              //   from: 'cccDesk_SoftPhone',
              //   msg: '与WebCall连接已经关闭或不可用',
              // })
              break
            default:
              SoftPhone.log('cccDesk_SoftPhone:连接状态[' + 'm_readyState' in SoftPhone._websocket ? SoftPhone._websocket.m_readyState : SoftPhone._websocket.readyState + ']')
          }
        }
      } else {
        SoftPhone.log('cccDesk_SoftPhone:连接为null')
      }
    } catch (ex) {
      SoftPhone.log('cccDesk_SoftPhone:发送消息异常')
      for (x in ex) {
        SoftPhone.log(x + ':' + ex[x])
      }
      SoftPhone.log(ex)
    }
  },
  newWebSocket: function (url) {},
  /**
   * 设置连接关闭的消息监听
   * @param event
   */
  setOncloseEvent: function (event_fun) {
    SoftPhone.onclose_event = event_fun
  },
  /**
   * 设置连接开始的消息监听
   * @param event
   */
  setOnconnectionEvent: function (connection_fun) {
    SoftPhone.onconnection_fun = connection_fun
  },
  log: function (c) {
    cccDesk_CallCenter.log(c)
    return this
  }
}
export { SoftPhone }
