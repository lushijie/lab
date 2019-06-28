/*
* @Author: lushijie
* @Date:   2016-11-29 10:45:45
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-12 20:24:50
* * * * * * * * * * * * * * * * * * * * * *
* gulp create [--title=标题] [--uid=2012-02-32-23411]     //创建页面
* gulp del    [--uid=uid]       //删除页面
* gulp pub                      //发布到github
* gulp grab                     //抓取标题写入到README.md
* gulp rsync [--user=lushijie]  //同步到远程机
* gulp tmod                     //deprecated
*/

const gulp = require('gulp');
const path = require('path');
const argv = require('yargs').argv;
const chalk = require('chalk');
const shell = require('gulp-shell');
// const exec = require('child_process').exec;
// const os = require('os');
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

//数字补0
function padNum(num, n) {
  var len = num.toString().length;
  while(len < n) {
    num = "0" + num;
    len++;
  }
  return num;
}

//对文件夹级联删除
function deleteFolderRecursive (path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

const uidSuffix = '-' + padNum(moment().format('H')*60*60 + moment().format('m')*60 + moment().format('s')*1, 5); // max 86399
// const USER_NAME = argv.user || os.userInfo().username;

var uid = moment().format('YYYY-MM-DD') + uidSuffix;
uid = argv.uid || uid;

const PAGE_TITLE = (argv.title && argv.title.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')) || uid;
const URL_PREFIX = 'https://lushijie.github.io/lab/www/';
const DEMOS_DIR = path.join(__dirname, '/www/');
const README_FILE = path.join(__dirname, 'README.md');
// const REMOTE_IP = '*.*.*.*';

//文件模板
const SCOFF_PATH = {
  js: path.join(__dirname,'/scaffold/page.js'),
  css: path.join(__dirname,'/scaffold/page.css'),
  html: path.join(__dirname,'/scaffold/page.html'),
  readme: path.join(__dirname,'/scaffold/readme.md'),
  titleIgnore: path.join(__dirname,'/www/.titleignore'),
}


//------新建DEMO------
gulp.task('create', function() {
  console.log(chalk.green('\n<<<<<<创建UID为: '+ uid +'的demo >>>>>>'));
  var theDemoPath = path.join(DEMOS_DIR, uid);

  //创建demo实例目录
  if(fs.existsSync(theDemoPath)) {
    console.log('创建失败，文件夹已经存在');
    return;
  }
  fs.mkdirSync(theDemoPath);

  //创建js
  var data = fs.readFileSync(SCOFF_PATH.js, 'utf8');
  fs.writeFileSync(path.join(theDemoPath, 'index.js'), data);
  console.log(chalk.green('JS 模板创建成功 ... ✔'));

  //创建css
  var data = fs.readFileSync(SCOFF_PATH.css, 'utf8');
  fs.writeFileSync(path.join(theDemoPath, 'index.css'), data);
  console.log(chalk.green('CSS 模板创建成功 ... ✔'));

  //创建html
  var data = fs.readFileSync(SCOFF_PATH.html, 'utf8');
  data = data.replace(/<%\s*title\s*%>/g, PAGE_TITLE);
  fs.writeFileSync(path.join(theDemoPath, 'index.html'), data);
  console.log(chalk.green('HTML 模板创建成功 ... ✔'));

  gulp.start('grab');
});


//------删除DEMO------
gulp.task('del', function() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  function confirmDel(uid) {
    uid = uid.toString();
    rl.question(chalk.green('\n<<<<<<删除UID为 ' + uid + '的demo, 【 y/n 】? >>>>>>') , (answer2) => {
      if(answer2 == 'y'){

        //删除文件夹
        if(fs.existsSync(path.join(DEMOS_DIR, uid))) {
          deleteFolderRecursive(path.join(DEMOS_DIR, uid));
          console.log(chalk.green('demo 文件夹删除成功 ... ✔'));
        }else {
          console.log(chalk.yellow('demo 文件夹不存在 ... ⚠'))
        }

        //获取要删除的链接
        var delString = fs.readFileSync(SCOFF_PATH.readme, 'utf8'),
            href = URL_PREFIX + uid + '/(.*)',
            tmp1 = delString.replace(/<\s*%href\s*%>/g, href).replace(/<%\s*title\s*%>/g, '.*?');

        //从readme.md删除链接
        var readmeData = fs.readFileSync(README_FILE, 'utf8');
        var rep = new RegExp(tmp1).test(readmeData);

        if(rep) {
          readmeData = readmeData.replace(new RegExp(tmp1), '');
          fs.writeFileSync(README_FILE, readmeData);
          console.log(chalk.green('demo标题删除成功 ... ✔ '));
        }else {
          console.log(chalk.yellow('demo标题不存在 ... ⚠'))
        }
      }else {
        console.log(chalk.green('😜 取消删除 ... ✔ \n'));
      }
      rl.close();
    });
  }

  if(argv.uid) {
    confirmDel(argv.uid);
  } else {
    console.log(chalk.red('\n 😱 请按 gulp del --uid=uid 方式删除demo ... ⚠ \n'))
  }
})


//------arttemplate编译------
// gulp.task('tmod', shell.task([
//     'tmod ./www/resource/tpl --outpt ./build'
// ]));


//------rsync------
// gulp.task('rsync', function(){
//   var localBasePath = path.join(__dirname, '/www/'),
//       remoteBasePath = ' ' + USER_NAME + '@' + REMOTE_IP + ':~'+ USER_NAME+'/msgSSP/www',
//       cmd = " rsync -avH --delete " + localBasePath + remoteBasePath;

//   exec(cmd, {maxBuffer: 4*1024*1024*1024, cwd: __dirname}, function(error, stdout, stderr){
//     if(error) {
//       console.log(error);
//       return;
//     }
//     if(stdout) {
//       console.log(stdout);
//     }
//   });
// });


//------发布到github-------
gulp.task('pub', shell.task([
  'rm -rf npm-debug.log',
  'git add .',
  'git commit -m "' + (argv.msg || moment().format('YYYY-MM-DD HH:mm:ss')) + '"',
  'git push origin'
]));


//------抓取标题写入到README.md------
gulp.task('grab', function() {
  var count = 0, titleString = '';

  console.log(chalk.green('\n<<<<<<开始抓取demo的标题，生成README.md>>>>>>'))
  fs.writeFileSync(README_FILE, '页面列表\n\n');

  //首页始终默认为index.html
  gulp.src(path.join(DEMOS_DIR) + '/**/index.html', function(err, files) {
    files.reverse();

    //count统计有效demo个数
    if(count == 0) {
      count = files.length;
    }

    files.forEach(function(ele, index) {
      //遍历文件获取UID与title
      var matchResult = ele.match(/.*\/www\/(.*\/)index.html/);
      var htmlPath = matchResult[0],
          uid = matchResult[1].split('/')[0];

      var isInTitleIgnore = fs.readFileSync(SCOFF_PATH.titleIgnore, 'utf8').indexOf(uid) > -1;
      //uid 首字符-不进行抓取, 在titleignore中的uid也不抓取
      if(uid[0] === '-' || isInTitleIgnore) {
        count--;
        return;
      }

      //生成该demo的线上浏览URL
      const PAGE_TITLE = fs.readFileSync(htmlPath, 'utf8')
        .match(/<title>(.*)<\/title>/m)[1].trim() || uid;
      titleString += fs.readFileSync(SCOFF_PATH.readme, 'utf8')
        .replace(/<\s*%href\s*%>/g, URL_PREFIX + matchResult[1] + 'index.html')
        .replace(/<%\s*title\s*%>/g, PAGE_TITLE)
    });

    //写入readme
    fs.appendFileSync(README_FILE, titleString)
    console.log(chalk.green('😃 共计' + count + ' 个标题写入README.md成功 ... ✔\n'));
  });
});


//------default------
gulp.task('default', function(cb) {
  gulp.run('create');
});
