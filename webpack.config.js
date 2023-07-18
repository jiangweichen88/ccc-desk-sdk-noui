//__dirname:代表当前文件所在目录的绝对路径 D:\xxx\xxx
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path') //用来解析路径相关信息的模块
module.exports = {
  //配置对象
  //入口
  entry: {
    // dev: path.resolve(__dirname, 'src/index.js'),
    lib: path.resolve(__dirname, 'src/lib.js'),
  },
  //出口
  output: {
    library: 'cccDeskSDK',
    libraryTarget: 'umd',
    libraryExport: 'default', // 增加这个属性
    filename: 'static/js/[name].bundle.js', //可以带路径.[name]为entry下面路径名称 为xxx
    path: path.resolve(__dirname, 'dist'),
  },

  //模块加载器

  module: {
    rules: [
      //处理es6转es5
      {
        test: /\.js$/, //用于匹配文件（对哪些文件进行处理）
        //exclude: /node_modules/, //排除，第三方是已经编译好的，不需要再进行编译
        include: [path.resolve(__dirname, 'src')], //只针对哪些处理，要写绝对路径,要用path来解析
        use: {
          loader: 'babel-loader',
          options: {
            //预设包，预先帮你准备好的，包含多个常用插件包的一个大包，目的：简化配置，便于管理。  依赖声明里面声明的依赖就是直接依赖，其他依赖里面声明的依赖是间接依赖 。es6由30多语法组成，每个语法都有自己的babel解析（比如箭头函数的依赖解析，比如forof的依赖解析包）,如果自己一个一个配的话，很麻烦，所以有一个大包，包含es678的语法解析包。配置一个这个就可以。
            // presets: ['@babel/preset-env'],
            presets: ['env'],
            plugins: [], //配置babel里面不包含的一些插件
          },
        },
      },
      //处理css
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      //处理图片
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)$/,
        use: [
          {
            loader: 'url-loader', //小于limit进行对小图片进行base64编码，大于他则生成一个图片，位置则为name
            options: {
              limit: 8192,
              name: 'static/img/[name].[hash:7].[ext]', //相对于output.path，name只要写他的下级的路径 [name] 图片的name。[hash:7]根据图片的内容产生，进行MD5加密后生成一个32位值，取前7位。有用，可以利用浏览器的缓存
            },
          },
        ],
      },
    ],
  },

  //插件 常见的插件 html-webpack-plugin const 的是一个构造函数，我们引入的是一个实例
  plugins: [
    new HtmlWebpackPlugin({
      //配置选项
      template: 'index.html', //将哪个页面作为模板页面处理(在根目录找)
      filename: 'index.html', //生成页面，（在output指令的path下，已经制定了一个出口路径）
    }),
  ],

  devServer: {
    open: true, //自动打开浏览器
    quiet: true, //不做太多日志输出
    hot: true, //允许热加载
  },

  devtool: 'cheap-module-eval-source-map', //开启source-map调试
}
