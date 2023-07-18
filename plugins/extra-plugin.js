const fs = require('fs')
const path = require('path')
const compressing = require('compressing')
class ExtraPlugin {
  constructor(opts) {
    // super()
    // console.log('opts', opts)
    // Object.keys(opts).forEach((v) => {
    //   this[v] = opts[v]
    // })
  }
  apply(compiler) {
    compiler.hooks.beforeRun.tap('MyPlugin', (stats) => {
      // console.log('Building...构建开始之前')
      // console.log(stats.context)
      // const outputPath = stats.compilation.outputOptions.path
    })
    compiler.plugin('done', (stats) => {
      const outputPath = stats.compilation.outputOptions.path
      const contextPath = stats.compilation.compiler.context
      // console.log(outputPath, stats)
      const sourceDir = contextPath
      const excludeSubdirs = ['node_modules', '.git', 'dist', 'plugins'] // 要排除的子文件夹名称列表
      const excludeFiles = ['.gitignore', 'yarn-error.log', '.DS_Store', '.babelrc'] // 要排除的文件名列表
      const destinationDir = path.join(path.dirname(contextPath), 'ccc-desk-sdk-noui-private') // 目标文件夹路径，当前文件路径的父文件夹路径
      const packagePath = `${contextPath}/package.json`
      // 读取 JSON 文件
      fs.readFile(packagePath, 'utf8', (err, data) => {
        if (err) throw err
        // 将 JSON 数据解析为对象
        const obj = JSON.parse(data)
        // 获取或修改某个属性
        const versionStr = obj.version
        const versionParts = versionStr.split('.')
        const lastNumber = parseInt(versionParts.pop(), 10)
        const incrementedVersion = versionParts.join('.') + '.' + (lastNumber + 1)
        // 输出自增后的版本号
        console.log(incrementedVersion, '自增后的版本号')
        obj.version = incrementedVersion
        // 将修改后的对象重新转换为 JSON 字符串
        const updatedJSON = JSON.stringify(obj, null, 2)
        // 将修改后的 JSON 字符串写回文件
        fs.writeFile(packagePath, updatedJSON, 'utf8', (err) => {
          if (err) throw err
          console.log('属性已成功修改！')
        })
      })
      // 删除文件夹，recursive选项表示会递归删除子级目录
      if (fs.existsSync(destinationDir)) {
        fs.rmdirSync(destinationDir, { recursive: true })
      }
      // 创建文件夹
      try {
        fs.mkdirSync(destinationDir, { recursive: true })
        console.log(`Folder ${destinationDir} created successfully.`)
      } catch (err) {
        console.error(`Error creating folder ${destinationDir}:`, err)
      }
      copyFiles(sourceDir, excludeSubdirs, excludeFiles)
      compressing.tgz
        .compressFile(destinationDir, `${destinationDir}.tgz`)
        .then(() => {
          console.log('压缩为tgz成功')
        })
        .catch(() => {})
      function copyFiles(dir, excludeSubdirs, excludeFiles) {
        const files = fs.readdirSync(dir)

        for (const file of files) {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            if (excludeSubdirs.includes(file)) {
              // 如果当前文件夹是需要排除的子文件夹，则跳过
              continue
            }
            const destPath = path.join(dir.replace(sourceDir, destinationDir), file)
            fs.mkdirSync(path.dirname(destPath), { recursive: true }) // 创建目标文件夹
            // copyFiles(filePath, excludeSubdirs, excludeFiles) // 递归拷贝子文件夹
            // console.log(filePath, 'filePath', destPath)
            copyFolder(filePath, destPath)
          } else {
            if (excludeFiles.includes(file)) {
              // 如果当前文件是需要排除的文件，则跳过
              continue
            }
            const destPath = path.join(destinationDir, file)
            fs.copyFileSync(filePath, destPath) // 拷贝文件到目标文件夹
          }
        }
      }
      // 复制文件夹
      function copyFolder(source, destination) {
        // 获取源文件夹的统计信息
        fs.stat(source, (err, stats) => {
          if (err) {
            console.error(err)
            return
          }

          // 创建目标文件夹（如果不存在）
          fs.mkdir(destination, { recursive: true }, (err) => {
            if (err) {
              console.error(err)
              return
            }

            // 复制文件（递归）
            fs.readdir(source, (err, files) => {
              if (err) {
                console.error(err)
                return
              }

              files.forEach((file) => {
                const sourcePath = path.join(source, file)
                const destinationPath = path.join(destination, file)
                const stat = fs.statSync(sourcePath)
                if (stat.isDirectory()) {
                  copyFolder(sourcePath, destinationPath)
                } else {
                  fs.copyFile(sourcePath, destinationPath, (err) => {
                    if (err) {
                      console.error(err)
                    } else {
                      console.log(`File ${file} copied successfully.`)
                    }
                  })
                }
              })
            })
          })
        })
      }
    })
  }
}

module.exports = ExtraPlugin
