export default class EventBus {
  constructor() {
    this.events = {} // { key1: [fn1, fn2], key2: [fn1, fn2] }
    this.onceEvents = {}
  }

  on(type, fn) {
    const events = this.events
    if (events[type] == null) events[type] = []
    events[type].push(fn)
  }

  once(type, fn) {
    const onceEvents = this.onceEvents
    if (onceEvents[type] == null) onceEvents[type] = []
    onceEvents[type].push(fn)
  }

  off(type, fn) {
    if (!fn) {
      // 解绑所有事件
      this.events[type] = []
      this.onceEvents[type] = []
    } else {
      // 解绑单个事件
      const fnList = this.events[type]
      const onceFnList = this.onceEvents[type]
      if (fnList) {
        this.events[type] = fnList.filter((curFn) => curFn !== fn)
      }
      if (onceFnList) {
        this.onceEvents[type] = onceFnList.filter((curFn) => curFn !== fn)
      }
    }
  }

  emit(type, ...args) {
    const fnList = this.events[type]
    const onceFnList = this.onceEvents[type]

    if (fnList) {
      fnList.forEach((f) => f(...args))
    }
    if (onceFnList) {
      onceFnList.forEach((f) => f(...args))

      // once 执行一次就删除
      this.onceEvents[type] = []
    }
  }
}
