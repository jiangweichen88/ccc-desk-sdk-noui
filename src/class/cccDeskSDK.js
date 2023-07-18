import { deepMerge, parseDom } from '../utils/index.js'
import { webSocketClass } from './webSocket.js'
// const beepWav = require('../assets/plugins/beep.wav')
// const CalledHangupWav = require('../assets/plugins/CalledHangup.wav')
import beepWav from '../assets/plugins/beep.wav'
import CalledHangupWav from '../assets/plugins/CalledHangup.wav'
const CCCDeskSDK_noUI = class CCCDeskSdk {
  constructor(_opts = {}) {
    //构造初始化socket参数
    const defaultPs = {
      options: {
        lang: _opts.lang || 'zh', //语言
        isUI: _opts.isUI || true, //是否需要UI界面
        agentId: _opts.options.seatName,
        password: _opts.options.seatPassword_MD5,
        wsUrl: 'wss://dev.arccocc.com/ws', //ws地址
        phoneType: 3, // 登录方式 "0"手机, "1"sip/硬话机, "2"webcall , "3"webrtc
        isIntelligentOutbound: 0, // 是否智能外呼，0否，1是
        workType: _opts.options.isIntelligentOutbound || 0,
        phone: _opts.options.sipId || '',
        callModel: _opts.options.callModel || 0, //工作模式 0 普通模式 1 预测模式
        isAutoAnswer: false, //是否自动接听
        extraOpts: {}
      }
    }
    const opts = deepMerge(defaultPs, _opts)
    Object.keys(opts).forEach((v) => {
      this[v] = opts[v]
    })
    // 单例
    // if (!CCCDeskSDK_noUI.instance) {
    //   CCCDeskSDK_noUI.instance = this
    // }
    // return CCCDeskSDK_noUI.instance
    return this
  }
  init() {
    let { options } = this
    //创建或挂载webrtc dom
    const domId = 'cccDeskSDK_webrtc'
    //没有此dom就新建
    if (!document.getElementById(domId)) {
      const dom = `<div id="cccDeskSDK_webrtc">
      <audio id="localVideo_cccDesk" autoplay></audio>
      <audio id="remoteVideo_cccDesk" autoplay></audio>
      <audio id="ringingVideo_cccDesk" loop src=${beepWav}></audio>
      <audio
        id="ringingBackVideo_cccDesk"
        src=${CalledHangupWav}
      ></audio>
    </div>`
      let outer = parseDom(dom)
      document.body.appendChild(outer)
    }
    //webSocket实例化
    let $wsInstance = new webSocketClass({
      wsOptions: {
        ...options
      }
    })
    $wsInstance.createWebSocket()
    console.log('wsInstance', $wsInstance)
    //把webSocket挂载到 cccDeskSDK，提供给不用UI的用户使用
    this.$wsInstance = $wsInstance
    window.$CCCSdkWsInstance = $wsInstance
    this.onReady && this.onReady(this)
    return this
  }
  request(type, extraObj = {}) {
    this.$wsInstance.request(type, extraObj)
  }
  getStatusOff(fn) {
    window.$CCCSdkWsInstance.eventBus.off('socket_onmessage', fn)
  }
  //获取当前状态
  getStatus(cb) {
    // window.$CCCSdkWsInstance.eventBus.off('socket_onmessage', cb)
    window.$CCCSdkWsInstance.eventBus.on('socket_onmessage', cb)
  }
  getIsOutbound(body) {
    let isOutbound
    if (body.dir === 1 && body.type === 'user') {
      isOutbound = 1
    } else if (body.dir === 0 && body.type === 'agent') {
      isOutbound = 0
    }
    return isOutbound
  }
}
export { CCCDeskSDK_noUI }
