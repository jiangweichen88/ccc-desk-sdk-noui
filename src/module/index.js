import { WebrtcPhone } from './webrtcPhone.js'
import { SoftPhone } from './softPhone.js'
import { set, get } from '@/utils/index.js'

const cccDesk_CallCenter = {
  // 打印日志
  log: function (c, source, send3cs) {
    if (cccDesk_CallCenter._nolog) {
      return this
    }
    var src = source ? source : 'SDK'
    var send = send3cs ? send3cs : true

    if (window.console && window.console.log) {
      if (typeof c === 'string') {
        if (c === 'WebRTC') {
          c = '[' + cccDesk_CallCenter.dateNow() + '] ' + 'WebRTC：' + 'Print：' + (typeof source === 'string' ? source : JSON.stringify(source))
        } else {
          c = '[' + cccDesk_CallCenter.dateNow() + '] ' + src + 'Print：' + c
        }
      } else {
        c = '[' + cccDesk_CallCenter.dateNow() + '] ' + src + 'Print：' + JSON.stringify(c)
      }
      window.console.log(c)
    }

    return this
  },
  dateNow: function () {
    var date = new Date()
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var mm = date.getMinutes()
    var s = date.getSeconds()
    var sss = date.getMilliseconds()
    if (m < 10) {
      m = '0' + m
    }
    if (d < 10) {
      d = '0' + d
    }
    if (h < 10) {
      h = '0' + h
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    if (s < 10) {
      s = '0' + s
    }
    if (sss < 10) {
      sss = sss + '00'
    } else if (sss < 100) {
      sss = sss + '0'
    }
    return y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s + '.' + sss
  },
  // SDK自检
  selfChecking: function (data) {
    var sendobj = new cccDesk_CallCenter._sendcmd('ccsdk')
    sendobj.sequence = new Date().getTime()
    sendobj = common.extend(data, sendobj)
    if (cccDesk_CallCenter._islogin) {
      cccDesk_CallCenter.send(sendobj)
    }
  },
  // webrtc登录
  loginWebRtc: function (eventJson, json, type) {
    console.log(json, type, 'loginWebRtc')
    console.log('janus准备连接')
    type === 'reconnection' && SoftPhone.UnInitialize()
    WebrtcPhone.init({
      stunServers: json.stunServers && json.stunServers.split(','),
      server: 'wss://' + json.webrtc,
      sip_id: json.sipPhone,
      sip_pwd: json.sipPassword,
      // reconnection: Utils.reconnection,
      eventJson: eventJson,
      initType: type
    })
  },
  // webCall登录
  loginWebCall: function (json, type) {
    cccDesk_CallCenter.log('webcall准备连接')
    type === 'reconnection' && SoftPhone.UnInitialize()
    SoftPhone.init(json._media_ip, json._media_port, json.sipPhone, json.sipPassword, json, type)
  },
  isAutoAnswer: function () {
    const { isAutoAnswer } = $CCCSdkWsInstance.wsOptions
    return isAutoAnswer
  },
  setIsAutoAnswer: function (e) {
    set($CCCSdkWsInstance, 'wsOptions.isAutoAnswer', e)
  },
  //
  AcceptCall: function (json, type) {
    console.log($CCCSdkWsInstance, 'AcceptCall', json, type)
    const { phoneType } = $CCCSdkWsInstance.wsOptions
    if (phoneType === 3) {
      WebrtcPhone.AcceptCall()
    } else if (phoneType === 2) {
      SoftPhone.AcceptCall()
    }
  }
}
export { cccDesk_CallCenter }
