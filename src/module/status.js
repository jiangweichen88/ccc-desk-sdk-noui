// import { i18n } from '@/locale/lang'
import i18n from 'i18next'
/**
 * @description:
 * @param {*} sendArr ws发送请求需要的参数
 * @param {*} setSendArr 需要往ws实例存储的参数
 * @param {*} isShowStatus 是否在UI显示当前状态
 * @param {*} statusShowText 当前状态显示的文字，先取statusShowText再取name
 * @param {*} UIshow 配置展示的UI
 * @param {*} ThemeColor 主题颜色
 * @param {*} isUnlock 是不是解锁状态
 *
 * @return {*}
 */
const status = {
  locked: {
    name: i18n.t('status.locked'),
    isShowStatus: true
  },
  logon: {
    name: i18n.t('status.logon'),
    isShowStatus: true,
    statusShowText: {
      success: i18n.t('status.logon') + ' ' + i18n.t('main.success'),
      fail: i18n.t('status.logon') + ' ' + i18n.t('main.fail')
    },
    sendArr: ['agentId', 'password', 'phoneType', 'workType', 'phone', 'callModel'],
    setSendArr: '@all'
  },
  logout: {
    name: i18n.t('status.logout'),
    id: 'logout',
    isShowStatus: true,
    themeColor: '#FF3C34',
    isUnlock: true
  },
  startCall: {
    name: i18n.t('status.startCall'),
    isShowStatus: true,
    sendArr: ['called', 'caller', 'followData', 'callUui', 'agentCaller', 'callModel', 'autoAnswer', 'taskInfo']
  },
  ring: { name: i18n.t('status.ring'), isShowStatus: true },
  bridge: {
    name: i18n.t('status.bridge'),
    isShowStatus: true,
    sendArr: [],
    // setSendArr: ['called', 'caller'],
    UIshow: {
      phoneNum_show: true,
      actionBar_show: true,
      call_show: false
    }
  },
  hangup: {
    name: i18n.t('status.hangup'),
    isShowStatus: true,
    themeColor: '#FF3C34',
    isUnlock: true
  },
  reconnection: {
    name: i18n.t('status.reconnection'),
    isShowStatus: true,
    sendArr: ['agentId', 'password', 'phoneType', 'workType']
  },
  busy: {
    name: i18n.t('status.busy'),
    isShowStatus: true,
    themeColor: '#FF3C34',
    isUnlock: true
  },
  free: {
    name: i18n.t('status.free'),
    isShowStatus: true,
    isUnlock: true
  },
  quiet: {
    name: i18n.t('status.quiet'),
    isShowStatus: true,
    isUnlock: true
  },
  unQuiet: {
    name: i18n.t('status.unQuiet'),
    isShowStatus: true,
    isUnlock: true
  },
  hold: {
    name: i18n.t('status.hold'),
    isShowStatus: true,
    isUnlock: true
  },
  unHold: {
    name: i18n.t('status.unHold'),
    isShowStatus: true,
    isUnlock: true
  },
  error: {
    name: i18n.t('status.error'),
    isShowStatus: true,
    isUnlock: false
  }
}
export { status }
