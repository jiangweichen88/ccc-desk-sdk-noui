import { status } from '../module/status.js'
import { cccDesk_CallCenter } from '../module/index.js'

function deepMerge(obj1, obj2) {
  let key
  for (key in obj2) {
    // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
    obj1[key] = obj1[key] && obj1[key].toString() === '[object Object]' ? deepMerge(obj1[key], obj2[key]) : (obj1[key] = obj2[key])
  }
  return obj1
}
// 构造ws的请求参数
function getSendObj(type, wsOptions, extraObj) {
  let sendObj = {
    aicc: 'message',
    request: type,
    body: {
      timestamp: new Date().getTime(),
      ...extraObj
    }
  }
  // if (!status[type] && type !== 'keepalive') {
  //   cccDesk_CallCenter.log('错误的请求类型：' + type)
  //   return {}
  // }
  wsOptions &&
    status[type] &&
    status[type].sendArr &&
    status[type].sendArr.forEach((v) => {
      //实例上有此参数才获取，防止报错
      if (wsOptions.hasOwnProperty(v)) {
        sendObj.body[v] = wsOptions[v]
      }
    })
  return sendObj
}
//给ws实例追加属性
function setSendObj(type, _wsOptions, body = null) {
  let wsOptions = Object.assign({}, _wsOptions)
  const setSendArr = (status[type] && status[type].setSendArr) || null
  // 全量添加
  if (body && wsOptions && setSendArr && setSendArr === '@all') {
    wsOptions = { ...wsOptions, ...body }
  } else if (setSendArr && body) {
    //根据配置添加
    setSendArr.forEach((v) => {
      //返回的参数有才获取，防止报错
      if (body.hasOwnProperty(v)) {
        wsOptions[v] = body[v]
      }
    })
  }
  return wsOptions
}
// 字符串转dom
function parseDom(arg) {
  const objE = document.createElement('div')
  objE.innerHTML = arg
  return objE
}
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Load script from ${url} failed`))
    script.src = url
    const head = document.head || document.getElementsByTagName('head')[0]
    ;(document.body || head).appendChild(script)
  })
}
const RESOURCE_LIST = ['https://at.alicdn.com/t/c/font_3945904_8lgqy7wmzdf.js']

export function loadResourceList() {
  return RESOURCE_LIST.reduce((res, el) => res.then(() => loadScript(el)), Promise.resolve())
    .then(() => {
      console.log('success')
    })
    .catch((error) => {
      console.error('图标加载失败:', error.name, error.message)
      return Promise.reject(error)
    })
}
// 秒转时间(HH:mm:ss)
function secondsToHours(sec) {
  var hrs = Math.floor(sec / 3600)
  var min = Math.floor((sec % 3600) / 60)
  sec = sec % 60
  sec = sec < 10 ? '0' + sec : sec
  min = min < 10 ? '0' + min : min
  hrs = hrs < 10 ? '0' + hrs : hrs
  return hrs + ':' + min + ':' + sec
}
function get(object, path, defaultValue) {
  // 判断 object 是否是数组或者对象，否则直接返回默认值 defaultValue
  if (typeof object !== 'object') return defaultValue
  // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
  return _basePath(path).reduce((o, k) => (o || {})[k], object) || defaultValue
}

// 处理 path， path有三种形式：'a[0].b.c'、'a.0.b.c' 和 ['a','0','b','c']，需要统一处理成数组，便于后续使用
function _basePath(path) {
  // 若是数组，则直接返回
  if (Array.isArray(path)) return path
  // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
  return path.replace(/\[/g, '.').replace(/\]/g, '').split('.')
}
function set(object, path, value) {
  if (typeof object !== 'object') return object
  _basePath(path).reduce((o, k, i, _) => {
    if (i === _.length - 1) {
      // 若遍历结束直接赋值
      o[k] = value
      return null
    } else if (k in o) {
      // 若存在对应路径，则返回找到的对象，进行下一次遍历
      return o[k]
    } else {
      // 若不存在对应路径，则创建对应对象，若下一路径是数字，新对象赋值为空数组，否则赋值为空对象
      o[k] = /^[0-9]{1,}$/.test(_[i + 1]) ? [] : {}
      return o[k]
    }
  }, object)
  // 返回object
  return object
}
export { deepMerge, getSendObj, setSendObj, secondsToHours, parseDom, get, set }
