import { deepMerge, getSendObj, setSendObj } from '../utils/index.js'
import { status } from '../module/status.js'
import { cccDesk_CallCenter } from '../module/index.js'
import EventBus from './eventBus.js'
const webSocketClass = class WebSocketClass {
  constructor(_opts = {}) {
    const wsOptions = _opts.wsOptions
    this.socketInstance = null
    this.cccDesk_CallCenter = cccDesk_CallCenter
    const defaultPs = {
      lockReconnect: false, //避免重复连接
      isLogout: false, //是否登出
      tt: null, //重连的计时器
      timeout: 25000, //每隔三秒发送心跳
      num: 3, //3次心跳均未响应重连
      timeoutObj: null, //心跳计时器
      isOutbound: false, //是否外呼
      isHangupError: false, //是否挂断错误
      currentStatusData: {}, //当前ws状态数据
      statusDataList: [], //状态list
      wsOptions: {},
      eventBus: new EventBus()
    }
    let opts = deepMerge(defaultPs, _opts)
    console.log(opts)
    Object.keys(opts).forEach((v) => {
      this[v] = opts[v]
    })
    // 单例
    // if (!webSocketClass.instance) {
    //   webSocketClass.instance = this
    // }
    // return webSocketClass.instance
    return this
  }
  createWebSocket() {
    console.log('createWebSocket', window.cccDeskOnmessageFn)
    if (this.socketInstance) {
      this.socketInstance.close()
    }
    const { wsUrl } = this.wsOptions
    try {
      this.socketInstance = new WebSocket(wsUrl)
      this.init()
    } catch (e) {
      console.log('catch')
      if (!this.isLogout) this.reconnect(wsUrl)
    }
  }

  init() {
    console.log('Socket init')
    const { wsUrl } = this.wsOptions
    let { socketInstance } = this
    socketInstance.onclose = () => {
      console.log('socket-onclose')
      if (!this.isLogout) this.reconnect(wsUrl)
    }
    socketInstance.onerror = () => {
      console.log('socket-onerror')
      //发布数据
      let json = { name: 'error', body: { status: 0, reason: 'error' } }
      this.eventBus.emit('socket_onmessage', json)
      if (!this.isLogout) this.reconnect(wsUrl)
    }
    socketInstance.onopen = () => {
      console.log('socket-onopen')
      //心跳检测重置
      this.heartCheck()
      //签入
      this.request('logon')
    }
    socketInstance.onmessage = (event) => {
      // console.log('socket-onmessage')
      const json = JSON.parse(event.data)
      // 向实例填充参数
      // console.log(json)
      this.wsOptions = setSendObj(json.name, this.wsOptions, json.body)
      const { body, name: type } = json
      let wsOptions = this.wsOptions
      //调试写死的参数
      let aa = {
        // _media_ip: '192.168.16.23',
        // _media_port: 8880
        _media_ip: wsOptions.sipRegister ? wsOptions.sipRegister.split(':')[0] : '',
        _media_port: wsOptions.sipRegister ? wsOptions.sipRegister.split(':')[1] : ''
      }
      // wsOptions = { ...wsOptions }
      wsOptions = { ...wsOptions, ...aa }
      const { phoneType } = wsOptions
      switch (type) {
        case 'logon':
          // 登录
          if (body.status === 0) {
            this.isLogout = false
            if (phoneType === 3) {
              cccDesk_CallCenter.loginWebRtc(body, wsOptions, type)
            } else if (phoneType === 2) {
              cccDesk_CallCenter.loginWebCall(wsOptions, type)
            }
          } else {
            this.isLogout = true
          }
          break
        case 'reconnection':
          if (body.status === 0) {
            if (phoneType === 2) {
              cccDesk_CallCenter.loginWebCall(wsOptions, type)
            }
          }

          break
        case 'hangupIng':
          // 挂断异常
          if (body.status !== 0) {
            isHangupError = true
          }
          break
        case 'hangup':
          break
        case 'ring':
          // if (body.dir === 1 && body.type === 'user') {
          //   // alert('外呼')
          //   this.isOutbound = true
          // } else if (body.dir === 0 && body.type === 'agent') {
          //   this.isOutbound = false
          //   // alert('呼入')
          // }
          break
        case 'logout':
          // 登出
          if (body.status === 0) {
            this.isLogout = true
          } else {
            this.isLogout = false
          }
          break
        default:
      }
      // dir
      // 更新janus
      // updateJanus()
      //发布数据
      if (type !== 'keepalive') {
        this.currentStatusData = json
        if (this.statusDataList.length < 3) {
          this.statusDataList.push(json)
        } else {
          this.statusDataList.shift()
          this.statusDataList.push(json)
        }
        // console.log(this.statusDataList, 'this.statusDataList')
        //bridge,answers顺序不定，需要兼容
        const statusDataList = this.statusDataList
        if (type === 'bridge' && statusDataList[statusDataList.length - 2].name != 'answer') {
          return
        }
        if (type === 'answer' && statusDataList[statusDataList.length - 2].name === 'bridge') {
          let _json = {
            ...json,
            name: 'bridge'
          }
          this.eventBus.emit('socket_onmessage', _json)
          return
        }
        this.eventBus.emit('socket_onmessage', json)
      }
      //拿到任何消息都说明当前连接是正常的
      this.heartCheck()
    }
  }
  send(json) {
    if (json.request === 'logout') {
      this.isLogout = true
    }
    this.socketInstance && this.socketInstance.send(JSON.stringify(json))
  }
  close() {
    this.socketInstance && this.socketInstance.close()
  }
  // 重连
  reconnect(url) {
    const { wsUrl } = this.wsOptions
    let { lockReconnect, tt } = this
    if (lockReconnect) {
      return
    }
    this.lockReconnect = true
    this.reset()
    //没连接上会一直重连，设置延迟避免请求过多
    tt && clearTimeout(this.tt)
    this.tt = setTimeout(() => {
      this.createWebSocket(url)
      // this.request('reconnection')
      this.lockReconnect = false
    }, 4000)
  }
  //心跳检测
  heartCheck() {
    let _this = this
    let { num, timeoutObj, timeout } = this
    timeoutObj && clearTimeout(this.timeoutObj)
    this.timeoutObj = setTimeout(() => {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      if (!this.isLogout) this.send(getSendObj('keepalive')) // 心跳包
      this.num--
      //计算答复的超时次数
      if (num === 0 && _this.socketInstance) {
        // _this.socketInstance.close()
      }
    }, timeout)
  }
  //获取当前状态的fn
  // getStatusFn(data) {
  //   return document.addEventListener('socket_onmessage', (data) => {
  //     cb(data.detail)
  //   })
  // }
  reset() {}
  //通用请求事件
  request(type, extraObj = {}) {
    // 发送请求前的操作
    // 外呼
    if (type === 'startCall') {
      this.isOutbound = true
    } else if (type !== 'keepalive') {
      this.isOutbound = false
    }
    let sendObj = getSendObj(type, this.wsOptions, extraObj)
    if (this.socketInstance && this.socketInstance.readyState === this.socketInstance.OPEN) {
      this.send(sendObj)
    }
    if (type === 'logout') {
      this.isLogout = true
    }
  }
  logonCreate() {
    this.isLogout = false
    this.createWebSocket()
  }
}

export { webSocketClass }
