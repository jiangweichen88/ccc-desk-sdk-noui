# newCCCDeskSDK_noUI_noUI

## 依赖安装

```shell
yarn
```

### 运行服务

默认 `src/index.js` 入口文件

```shell
yarn serve
```

### 打包库

默认 `src/index.js` 入口文件

```shell
yarn build
```

### 库使用示例

`yarn build` 之后得到

```html
<meta charset="utf-8" />
<title>CCCDeskSDK_noUI demo</title>
<body>

</body>
<script type=text/javascript src=CCCDeskSDK_noUI.b81b7443.js?b81b7443c4b286d4c680></script>
  console.log(CCCDeskSDK_noUI)
  var CCCDeskSDK_noUIInstance
  window.onload = function () {
    console.log(CCCDeskSDK_noUI)
    // 实例化
    CCCDeskSDK_noUIInstance = new CCCDeskSDK_noUI({
      options: {
        seatName: '2011@CSZHL', //坐席名称 *必填
        seatPassword_MD5: 'e10adc3949ba59abbe56e057f20f883e', // 坐席密码，MD5加密32位小写*必填
        wsUrl: 'wss://dev.arccocc.com/ws',
        // wsUrl: 'ws://192.168.110.69:8084/ws',
        extraOpts: {},
      },
    }).init()
    console.log(CCCDeskSDK_noUIInstance)
    CCCDeskSDK_noUIInstance.getStatus(function (status) {
      console.log('ws------当前状态：' + status.name, status)
    })
  }
</script>
```
