import { Janus } from './janus.js'
import { cccDesk_CallCenter } from './index.js'

var Utils = {
  pluginFrom: ['cccDesk_CallCenterPlugin', 'CC_SipPhone', 'cccDesk_SoftPhone', 'EC_SoftPhone'],
  enableMemberLog: true, // 是否打印栈
  pluginLog: function (msg, pluginFromIndex, member, notifyUser) {
    var _from = pluginFromIndex ? this.pluginFrom[pluginFromIndex] : this.pluginFrom[0]
    var _member = member && this.enableMemberLog ? '＜＜' + member + '＞＞' : ''
    if (notifyUser) {
      this.pluginAlert(msg)
    }
  },
  pluginAlert: function (msg) {
    console.log(msg)
  },
  pluginCauses: {
    // Common Causes
    INVALID_TARGET: { code: '', reason: '错误的目标' },
    CONNECTION_ERROR: { code: '', reason: 'WebSocket连接失败' },
    REQUEST_TIMEOUT: { code: '', reason: '响应超时' },
    SIP_FAILURE_CODE: { code: '', reason: 'SIP码错误' },
    // SIP Error Causes
    BUSY: { code: '486,600', reason: '服务忙' },
    REJECTED: { code: '403,603', reason: '服务被拒绝' },
    REDIRECTED: { code: '300,301,302,305,380', reason: '服务重定向' },
    UNAVAILABLE: { code: '408,410,430,480', reason: '服务不可用' },
    NOT_FOUND: { code: '404,604', reason: '服务未找到' },
    ADDRESS_INCOMPLETE: { code: '484', reason: '服务地址不正确' },
    INCOMPATIBLE_SDP: { code: '488,606', reason: 'SDK不兼容' },
    AUTHENTICATION_ERROR: { code: '401,407', reason: '认证失败' },
    // Session Causes
    BYE: { code: '', reason: '挂机' },
    CANCELED: { code: '', reson: '会话被取消' },
    NO_ANSWER: { code: '', reason: '久叫不应' },
    EXPIRES: { code: '', reason: '会话已过期' },
    NO_ACK: { code: '', reason: '会话未确认' },
    NO_PRACK: { code: '', reason: '' },
    USER_DENIED_MEDIA_ACCESS: { code: '', reason: '用户拒绝使用媒体' },
    WEBRTC_NOT_SUPPORTED: { code: '', reason: '浏览器不支持WebRTC服务' },
    RTP_TIMEOUT: { code: '', reason: 'RTP连接超时' },
    BAD_MEDIA_DESCRIPTION: { code: '', reason: '收到错误的SDP' },
    DIALOG_ERROR: { code: '408,481', reason: '会话错误' }
  },
  pluginError: function (cause, response, from, member, notifyUser) {
    var _cause = response ? '[' + response.status_code + ':' + response.reason_phrase + ':' + response.method + ']' : ''
    var sipErrorType = cause.trim().toUpperCase().replace(/\s+/g, '_')
    if (Utils.pluginCauses[sipErrorType]) {
      var reason = Utils.pluginCauses[sipErrorType].reason
      if (notifyUser) {
        this.pluginAlert(reason)
      }
      _cause += reason
    } else {
      _cause += 'reason:' + cause
    }
    Utils.pluginLog(_cause, from, member)
  }
}

/**
 * ---------------------------------------------- SIP
 **/
var sipConfig = {
  name: 'sipConfig',
  userAgent: null,
  uri: null,
  user: null,
  password: null,
  session: null,
  registrarServer: null,
  userAgentString: null,
  displayName: null, //
  remoteMedia: null,
  localMedia: null
}
var sc = JSON.parse(JSON.stringify(sipConfig))
var ringingDom = document.getElementById('ringingVideo_cccDesk')
var ringingBackDom = document.getElementById('ringingBackVideo_cccDesk')
/**
 * 事件处理
 **/
var sipEvents = {
  name: 'sipEvents',
  // 呼入事件
  sessionEvent: {
    // 来电处理中
    progressListener: function (response) {
      var msg = {
        from: response.from,
        to: response.to,
        callid: response.call_id,
        statusCode: response.status_code,
        reasonPhrase: response.reason_phrase,
        data: response.data,
        cseq: response.cseq,
        body: response.body,
        method: response.method,
        ua: response.ua
      }
      Utils.pluginLog('正在处理来电' + JSON.stringify(msg), 1, 'progressListener')
      console.log('Rtc====================Ringing')
    },
    // 来电摘机
    acceptedListener: function (data) {
      // 已接听
      sipEvents.mediaEvent.ringingStop()
      Utils.pluginLog('已接听' + data.code + '/' + data.response, 1, 'acceptedListener')
      sc.session.mediaHandler.render({
        remote: sc.remoteMedia
      })
    },
    // 接听失败
    rejectedListener: function (response, cause) {
      sipEvents.mediaEvent.ringingStop()

      Utils.pluginLog('接听失败' + JSON.stringify(response), 1, 'rejectedListener')
      Utils.pluginError(cause, response, 1, 'rejectedListener', true)
    },
    // 拒接
    cancelListener: function () {
      sipEvents.mediaEvent.ringingStop()

      Utils.pluginLog('拒接', 1, 'cancelListener')
    },
    // 出错了
    failedListener: function (response, cause) {
      sipEvents.mediaEvent.ringingStop()

      Utils.pluginLog('出错了' + JSON.stringify(response), 1, 'failedListener')
      Utils.pluginError(cause, response, 1, 'failedListener')
    },
    endedListener: function () {
      Utils.pluginLog('结束会话', 1, 'Ended')
      sipEvents.mediaEvent.ringingBackStar()
    }
  },
  // 初始化呼入事件
  initIncallSessionListener: function (session) {
    Utils.pluginLog('初始化呼入事件', 1, 'initIncallSessionListener')
    session.on('progress', this.sessionEvent.progressListener)
    session.on('accepted', this.sessionEvent.acceptedListener)
    session.on('rejected', this.sessionEvent.rejectedListener)
    session.on('cancel', this.sessionEvent.cancelListener)
    session.on('failed', this.sessionEvent.failedListener)
    session.on('terminated', this.sessionEvent.endedListener)
  },
  // 座席事件
  uaEvent: {
    // WebSocket连接中
    connectingListener: function (args) {
      console.log()
      Utils.pluginLog('正在连接SIP-WebSocket，已尝试' + args.attempts + '次', 1, 'connectingListener')
    },
    // WebSocket已连接
    connectedListener: function () {
      Utils.pluginLog('SIP-WebSocket已连接', 1, 'connectedListener')
    },
    // WebSocket连接断开
    disconnected: function () {
      Utils.pluginLog('SIP-WebSocket连接已断开', 1, 'disconnected')
      if (sc.userAgent.isRegistered()) {
        sc.session.start()
      }
    },
    // 注册监听
    registerListener: function () {
      Utils.pluginLog('SIP注册成功', 1, 'registerListener', true)
      cccDesk_CallCenter.init()
    },
    // 注册失败监听
    registerFailed: function (response, cause) {
      Utils.pluginLog(response, 1, 'registerFailed')
      Utils.pluginError(cause, response, 1, 'registerFailed', true)
    },
    // 呼入监听
    inviteListener: function (session) {
      Utils.pluginLog('收到来电', 1, 'inviteListener')
      sc.session = session
      sipEvents.initIncallSessionListener(sc.session)
      sipEvents.initMediaListener(sc.session.mediaHandler)
      sipEvents.mediaEvent.ringingStar()
      // 如果外呼 自动摘机
      if (cccDesk_CallCenter.isOutbound()) {
        CC_SipPhone.AcceptCall()
      }
    }
  },
  // 初始化座席事件
  initUAListener: function (ua) {
    Utils.pluginLog('初始化座席事件', 1, 'initListeners')
    ua.on('connecting', this.uaEvent.connectingListener)
    ua.on('connected', this.uaEvent.connectedListener)
    ua.on('disconnected', this.uaEvent.disconnected)
    ua.on('registered', this.uaEvent.registerListener)
    ua.on('registrationFailed', this.uaEvent.registerFailed)
    ua.on('invite', this.uaEvent.inviteListener)
  },
  // 媒体事件
  mediaEvent: {
    ringingStar: function () {
      console.log('开始铃响123==============')
      ringingDom.currentTime = 0
      setTimeout(function () {
        ringingDom.play()
      }, 50)
    },
    ringingStop: function () {
      setTimeout(function () {
        console.log('铃响停止123==============')
        ringingDom.pause()
      }, 50)
    },
    ringingBackStar: function () {
      console.log('话后开始铃响123==============')
      ringingBackDom.currentTime = 0
      ringingBackDom.play()
    },
    ringingBackStop: function () {
      console.log('话后铃响停止123==============')
      ringingBackDom.pause()
    },
    // 添加媒体流
    addStreamListener: function (stream) {
      Utils.pluginLog('添加媒体流' + stream, 1, 'addStreamListener')
      sc.session.mediaHandler.render({
        local: sc.localMedia,
        remote: sc.remoteMedia
      })
    },
    iceGatheringListener: function () {
      Utils.pluginLog('ICE开始找目标', 1, 'iceGatheringListener')
    },
    userMediaRequestListener: function (constraints) {
      Utils.pluginLog('正在获取媒体，等待响应中...', 1, 'userMediaRequestListener')
    },
    userMediaListener: function (stream) {
      Utils.pluginLog('媒体准备就绪', 1, 'userMediaListener')
    },
    userMediaFailedListener: function (error) {
      Utils.pluginLog('媒体获取失败', 1, 'userMediaFailedListener')
    }
  },
  // 初始化媒体事件
  initMediaListener: function (mediaHandler) {
    Utils.pluginLog('初始化媒体事件', 1, 'initMediaListener')
    mediaHandler.on('iceGathering', this.mediaEvent.iceGatheringListener)
    mediaHandler.on('addStream', this.mediaEvent.addStreamListener)
    mediaHandler.on('userMediaRequest', this.mediaEvent.userMediaRequestListener)
    mediaHandler.on('userMedia', this.mediaEvent.userMediaListener)
    mediaHandler.on('userMediaFailed', this.mediaEvent.userMediaFailedListener)
  }
}

/* --------------------- WebRtc --------------------- */
var WebrtcPhone = {
  name: 'WebrtcPhone',
  janus: null, //janus对象
  sipcall: null, // call对象
  config: {
    server: '', // websocket地址
    stunServers: [],
    opaqueId: 'janus-' + (typeof Janus === 'undefined' ? '' : Janus.randomString(12)), //随机id
    sip_id: null, // sip号
    sip_pwd: null, // sip密码
    spinner: null,
    registered: false,
    reconnection: {},
    eventJson: null
  },
  init: function (options) {
    console.log('initJanus options', options)

    Utils.pluginLog('初始化webrtc配置', 1, 'init')
    this.config.server = options.server
    this.config.sip_id = options.sip_id
    this.config.sip_pwd = options.sip_pwd
    this.config.stunServers = options.stunServers
    this.config.reconnection = options.reconnection || {} // 这是浅拷贝，请不要随意修改对象中的内容
    this.config.eventJson = options.eventJson
    this.config.initType = options.initType
    ringingDom = document.getElementById('ringingVideo_cccDesk')
    this.initJanus()
  },
  initJanus: function () {
    var that = this
    Janus.init({
      debug: 'all',
      callback: function () {
        if (!Janus.isWebrtcSupported()) {
          Janus.error('No WebRTC support... ')
          Utils.pluginAlert('No WebRTC support')
          return
        }
        console.log('initJanus', that)
        that.janus = new Janus({
          server: that.config.server,
          iceservers: that.config.stunServers,
          success: function () {
            console.log('Janus：初始化janus成功')
            that.janus.attach({
              plugin: 'janus.plugin.sip', // 固定
              opaqueId: that.config.opaqueId,
              success: function (pluginHandle) {
                that.sipcall = pluginHandle
                console.log('Janus：句柄创建成功')
                that.register()
              },
              error: function (error) {
                // cccDesk_CallCenter.error('--创建句柄失败--', error)
                Utils.pluginAlert('创建句柄失败')
              },
              consentDialog: function (on) {
                Janus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now')
              },
              iceState: function (state) {
                console.log('ICE state changed to ' + state)
              },
              mediaState: function (medium, on) {
                console.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
              },
              webrtcState: function (on) {
                console.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now')
              },
              onmessage: function (msg, jsep) {
                console.log(msg, jsep)
                Janus.debug(' ::: Got a message :::', msg)
                var error = msg['error']
                if (error) {
                  that.config.registered ? that.sipcall.hangup() : that.register()
                  console.log(error)
                  return
                }
                var callId = msg['call_id']
                var result = msg['result']
                if (result && result['event']) {
                  var event = result['event']
                  switch (event) {
                    case 'registration_failed': // 注册失败
                      Janus.warn('janus注册失败')
                      break
                    case 'registered':
                      console.log('janus注册成功')
                      if (!that.config.registered) {
                        // that.continueLogin()
                      }
                      break
                    case 'calling':
                      console.log('Waiting for the peer to answer...')
                      break
                    case 'incomingcall':
                      console.log('收到来电')
                      that.sipcall.callId = callId
                      var doAudio = true
                      var offerlessInvite = false
                      if (jsep) {
                        doAudio = jsep.sdp.indexOf('m=audio ') > -1
                        Janus.debug('Audio ' + (doAudio ? 'has' : 'has NOT') + ' been negotiated')
                      } else {
                        console.log("This call doesn't contain an offer... we'll need to provide one ourselves")
                        offerlessInvite = true
                      }
                      sipEvents.mediaEvent.ringingStar()
                      function connect() {
                        console.log('发送接听指令')
                        var sipcallAction = offerlessInvite ? that.sipcall.createOffer : that.sipcall.createAnswer
                        sipcallAction({
                          jsep: jsep,
                          media: { audio: doAudio, video: false },
                          success: function (jsep) {
                            console.log('接通成功')
                            var body = { request: 'accept' }
                            that.sipcall.send({ message: body, jsep: jsep })
                          },
                          error: function (error) {
                            Janus.error('WebRTC error:', error)
                            Utils.pluginAlert('接通失败')
                            var body = { request: 'decline', code: 480 }
                            that.sipcall.send({ message: body })
                          }
                        })
                      }
                      function unConnect() {
                        console.log('发送挂断指令')
                        var body = { request: 'decline' }
                        that.sipcall.send({ message: body })
                      }
                      // if (cccDesk_CallCenter.isOutbound() || cccDesk_CallCenter.isAuto()) {
                      //   connect()
                      //   sipEvents.mediaEvent.ringingStop()
                      // }
                      // alert($CCCSdkWsInstance.isOutbound, '1')
                      if (($CCCSdkWsInstance && $CCCSdkWsInstance.isOutbound) || cccDesk_CallCenter.isAutoAnswer()) {
                        connect()
                        sipEvents.mediaEvent.ringingStop()
                      }
                      that.AcceptCall = function () {
                        connect()
                        sipEvents.mediaEvent.ringingStop()
                      }
                      that.ReleaseCall = function () {
                        unConnect()
                        that.hangup()
                        sipEvents.mediaEvent.ringingStop()
                      }
                      break
                    case 'accepting':
                      break
                    case 'progress':
                      if (jsep) {
                        that.sipcall.handleRemoteJsep({
                          jsep: jsep,
                          error: that.hangup
                        })
                      }
                      break
                    case 'accepted':
                      console.log(result['username'] + ' accepted the call!', jsep)
                      if (jsep) {
                        that.sipcall.handleRemoteJsep({
                          jsep: jsep,
                          error: that.hangup
                        })
                      }
                      that.sipcall.callId = callId
                      break
                    case 'updatingcall':
                      console.log('通话更新')
                      var doAudio = jsep.sdp.indexOf('m=audio ') > -1
                      that.sipcall.createAnswer({
                        jsep: jsep,
                        media: { audio: doAudio, video: false },
                        success: function (jsep) {
                          Janus.debug('Got SDP ' + jsep.type + '! audio=' + doAudio + ':', jsep)
                          var body = { request: 'update' }
                          that.sipcall.send({ message: body, jsep: jsep })
                        },
                        error: function (error) {
                          Janus.error('WebRTC error:', error)
                        }
                      })
                      break
                    case 'message':
                      var sender = result['displayname'] ? result['displayname'] : result['sender']
                      var content = result['content']
                      content = content.replace(new RegExp('<', 'g'), '&lt')
                      content = content.replace(new RegExp('>', 'g'), '&gt')
                      console.log(content + 'Message from ' + sender)
                      break
                    case 'info':
                      var sender = result['displayname'] ? result['displayname'] : result['sender']
                      var content = result['content']
                      content = content.replace(new RegExp('<', 'g'), '&lt')
                      content = content.replace(new RegExp('>', 'g'), '&gt')
                      console.log(content + 'Info from ' + sender)
                      break
                    case 'notify':
                      var notify = result['notify']
                      var content = result['content']
                      console.log(content, 'Notify (' + notify + ')')
                      break
                    case 'transfer':
                      break
                    case 'hangup':
                      console.log('janus收到通话挂断')
                      sipEvents.mediaEvent.ringingStop()
                      break
                    default:
                      console.log('未知状态')
                      break
                  }
                }
              },
              onlocalstream: function (stream) {
                Janus.debug(' ::: Got a local stream :::', stream)
              },
              // 远程流
              onremotestream: function (stream) {
                Janus.debug(' ::: 音频流绑定audio :::', stream)
                Janus.attachMediaStream(document.getElementById('localVideo_cccDesk'), stream)
                setTimeout(function () {
                  var music = document.getElementById('localVideo_cccDesk')
                  if (music.paused) {
                    music.paused = false
                    music.play()
                  }
                }, 100)
              },
              oncleanup: function () {
                console.log(' ::: Got a cleanup notification :::')
                if (that.sipcall) {
                  that.sipcall.callId = null
                }
                // var events = cccDesk_CallCenter._events['oncleanup']
                // if (typeof events != 'undefined') {
                //   for (var key in events) {
                //     var fun = events[key]
                //     if (typeof fun == 'function') {
                //       try {
                //         setTimeout(function () {
                //           fun()
                //         }, 500)
                //       } catch (ex) {
                //         console.log(
                //           '调用外部注册事件异常，查看详情需要开启调试模式',
                //         )
                //         console.log(ex)
                //       }
                //     }
                //   }
                // }
              }
            })
          },
          error: function (error) {
            console.log(error)
            console.log('janus出现错误，请重新连接2')
            setTimeout(function () {
              window.$CCCSdkWsInstance.close()
            }, 500)
          },
          destroyed: function () {
            console.log('会话销毁')
          }
        })
      }
    })
  },
  // 接通(不可删除)
  AcceptCall: function () {},
  /**
   * @reserve 挂机（不可删除）
   **/
  ReleaseCall: function () {},
  // 静音
  Mute: function () {},
  /**
   * @public 取消静音
   **/
  UnMute: function () {},
  /**
   * @reserve 按键
   **/
  SendDTMF: function () {},
  continueLogin: function () {
    var json = this.config.eventJson
    console.log(json, 'json------------=======')
    var type = this.config.initType
    this.config.registered = true
    console.log('cccDesk_CallCenterStatus.login()')
    type === 'logon' ? cccDesk_CallCenterStatus.login() : cccDesk_CallCenterStatus.reconnection()
    var eventFun = cccDesk_CallCenter[type + '_event']
    var events = cccDesk_CallCenter._events[type] //是否有注册事件
    var transactionListener = cccDesk_CallCenter[type + '_transaction']
    if (typeof eventFun == 'function') {
      //是否有外部注册回调函数
      try {
        eventFun(json)
      } catch (ex) {
        console.log('调用外部注册事件异常，查看详情需要开启调试模式')
        console.log(ex)
      }
    }

    if (typeof events != 'undefined') {
      for (var key in events) {
        var fun = events[key]
        if (typeof fun == 'function') {
          try {
            fun(json)
          } catch (ex) {
            console.log('调用外部注册事件异常，查看详情需要开启调试模式')
            console.log(ex)
          }
        }
      }
    }
    if (typeof transactionListener === 'function') {
      try {
        transactionListener(json)
      } catch (e) {
        console.log('内部注册事件执行失败', e)
      }
    }
    cccDesk_CallCenter.executeMessage()
  },
  // 注销janus
  UnInitialize: function () {
    console.log('发送销毁janus指令')
    this.config.registered = false
    this.janus.destroy()
  },
  register: function () {
    var register = {
      request: 'register',
      username: this.config.sip_id,
      authuser: this.config.sip_id,
      display_name: this.config.sip_id,
      secret: this.config.sip_pwd
    }
    this.sipcall.send({ message: register })
  },
  hangup: function () {
    var hangup = { request: 'hangup' }
    this.sipcall.send({ message: hangup })
    this.sipcall.hangup()
  }
}

/* ---------------------- WebCall ----------------------- */
export { WebrtcPhone }
