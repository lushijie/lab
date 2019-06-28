/**
 * 文件上传功能
 * 基于webuploader的简单封装
 *
 * 用法如下：
 * 1. 设定容器的 data-xxx / data-xxx-yyy 属性来配置webuploader配置 与默认值或关系
 * 2. 设置错展示的选择器 data-wrap-xxxx指定特定展示容器，如data-wrap-file, data-wrap-error
 * 如：<div id="upload" data-wrap-error=""></div>
 */
;(function($, document, undefined) {
  // 大写第一个单词
  function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // function queryURL(url, key) {
  //   //去除网址与hash信息
  //   url = url.replace(/^[^?=]*\?/ig, '').split('#')[0];
  //   var json = {};
  //   url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
  //     try {
  //       key = decodeURIComponent(key);
  //     } catch(e) {}
  //     try {
  //       value = decodeURIComponent(value);
  //     } catch(e) {}

  //     if ( !(key in json) ) {
  //       json[key] = /\[\]$/.test(key) ? [value] : value;
  //     } else if (json[key] instanceof Array) {
  //       json[key].push(value);
  //     } else {
  //       json[key] = [json[key], value];
  //     }
  //   });
  //   return key ? json[key] : json;
  // }

  function getURLPath() {
    var url = location.protocol + '//' + location.hostname;
    if ( location.port != '80' ) {
      url += ':' + location.port;
    }
    url += location.pathname;
    return url;
  };

  function changePickStatus(selector, flag) {
    $(selector).find( '.webuploader-element-invisible' )
    .parent()
    .prev()
    [flag === true ? 'removeClass' : 'addClass']('webuploader-pick-disabled');
  }

  $.uploader = function(selector, opts, extraData) {
    var uploader;
    var $wrap = $(selector);

    if( $wrap.length <= 0 ) {
      return null;
    }

    // 可配置项 及映射
    var dataConfMap = {
      'auto': 'auto',
      'server': 'server',
      'multiple': 'pick.multiple',
      'acceptTitle': 'accept.title',
      'acceptExt': 'accept.extensions',
      'acceptMine': 'accept.mimeTypes',
      'fileSize': 'fileSingleSizeLimit',
      'fileVal': 'fileVal',
      'chunked': 'chunked',
      'chunkSize': 'chunkSize',
      'chunkRetry': 'chunkRetry',
      'threads': 'threads',
      'dnd': 'dnd'
    };
    // 默认值
    var conf = {
      // 自动上传
      auto: true,
      // 服务器地址
      server: '',
      // 容器指定
      pick: {
        // 容器选择器
        id: selector || '',
        // 按钮内容 - 首先看id内的内容
        innerHTML: '',
        // 单文件上传
        multiple: false
      },
      // 文件类型
      accept: {
        title: '',
        extensions: '',
        mimeTypes: ''
      },
      // 单文件大小
      fileNumLimit: 1,
      fileSingleSizeLimit: 5242880,
      // 服务端字段名
      fileVal: '',
      // 其他参数
      formData: {},

      // 分片
      chunked: false,

      chunkSize: 5 * 1024 * 1024,
      chunkRetry: 10,
      threads: 5,
      // 指定Drag And Drop拖拽的容器
      dnd: selector,

      // 禁用页面拖拽功能
      disableGlobalDnd: true,
      // 通过粘贴来添加截屏的图片
      paste: selector,

      swf: getURLPath() + '/resource/module/webuploader/Uploader.swf',
      resize: false,
      // 缩略图参数
      thumb: {},
      // 压缩配置参数
      compress: {},
      // 使用h5 还是 flash
      runtimeOrder: 'html5,flash',
      // 准备下个文件：图片压缩 md5
      prepareNextFile: true,
      // POST GET
      method: 'POST',
      // 二进制传输
      sendAsBinary: false,
      // 不去重
      duplicate: false,
      disableWidgets: undefined
    };

    // 设置方法
    function setConf(conf, key, val) {
      var arr = key.split('.'), len = arr.length, i = 0;
      var target = conf;
      // 点号遍历
      while( i<len-1 ) {
        var tmp = arr[i];
        target = conf[tmp] || {} ;
        i ++ ;
      }
      // 最终赋值
      if(val !== undefined) {
        target[ arr[i] ] = val;
      }
    }

    // data-xxxx属性
    $.each(dataConfMap, function(key, confKey) {
      console.log(key, confKey);
      if($.inArray(key, ['acceptTitle', 'acceptMine']) > -1) {
        var acceptExtList = $wrap.data('acceptExt').split(',');
        for(var i = 0; i < acceptExtList.length; i++){
          acceptExtList[i] = '.' + acceptExtList[i];
        }
        setConf(conf, confKey, acceptExtList.join(','));
      }else {
        setConf(conf, confKey, $wrap.data(key));
      }
    });
    // 其他额外参数
    // var dataParam = queryURL($wrap.data('param') || ''),

    // pars[$('meta[name="csrf-param"]').attr('content')] = $('meta[name="csrf-token"]').attr('content');

    var dataParam = extraData || {};
    //var pars = {};
    conf.formData = $.extend(true, {
      '_method': 'post'
    }, dataParam/*, pars*/);

    opts = $.extend(true, conf, opts);
    console.log(opts);

    // 实例化
    uploader = WebUploader.create(opts);

    var uploaderEvt = [
      'dndAccept','beforeFileQueued','fileQueued','filesQueued',
      'fileDequeued','reset','startUpload','stopUpload',
      'uploadFinished','uploadStart','uploadBeforeSend',
      'uploadAccept','uploadProgress','uploadError',
      'uploadSuccess','uploadComplete','error'
    ];

    var $filename = $($wrap.data('wrap-file'));
    var $progress = $($wrap.data('wrap-progress'));
    var $result = $($wrap.data('wrap-result'));

    // 展示信息
    function showMessage(errMsg, cls) {
      $progress.hide();
      cls = cls || 'upload-error';
      $result
        .removeClass('upload-success upload-error')
        .html(errMsg)
        .addClass(cls)
        .show();
    }

    var evtConf = {
      error: function(type, wfile) {
        var errMsg = '';
        console.error('error', type);
        switch( type ) {
          case 'Q_TYPE_DENIED':
            errMsg = '文件类型错误';
            break;
          case 'Q_EXCEED_NUM_LIMIT':
            errMsg = '最多只能添加' + (opts.fileNumLimit || 1) + '个文件';
            break;
          case 'Q_EXCEED_SIZE_LIMIT':
            errMsg = '超过允许添加的文件总大小';
            break;
          case 'F_EXCEED_SIZE':
            errMsg = '超过允许上传的最大文件大小';
            break;
          case 'F_DUPLICATE':
            errMsg = '重复上传文件';
            break;
          default:
            errMsg = '上传失败，请重试';
            break;
        }
        showMessage(errMsg);
      },

      // 所有文件都执行
      beforeFileQueued: function(wfile) {
        //console.log('beforeFileQueued');
        var originWfileName, originShortName;
        if(wfile) {
          originWfileName = originShortName = wfile.name;
          if(originWfileName && originWfileName.length > 25){
            originShortName = originWfileName.slice(0,12)+ '...' +originWfileName.slice(originWfileName.length-10, originWfileName.length);
          }
          $filename.val(originShortName).attr('title', originWfileName);
          $progress.html('').hide();
          $result.html('').hide();
        }
      },

      // 文件基本检验ok之后，如文件大小 类型 等
      fileQueued: function() {
        // console.log('fileQueued');
      },

      // 所有文件都执行，只是files是否有值 files -> []
      filesQueued: function(files) {},

      // 基本检验ok之后 无参数
      startUpload: function() {
        // console.log('startUpload');
        changePickStatus(selector, false);
      },

      uploadStart: function() {
        //console.log('uploadStart');
      },

      uploadProgress: function(wfile, percent) {
        percent = Math.round(percent * 100);
        // 测试暂停
        // if(percent>5){
        //  uploader.stop(true);
        // }
        var html = (percent == 100 ? '': '<i class="sj-upload__content__icon"></i>')
          + '<span class="upload-tips green"><b class="uname">'
          + wfile.name
          + '</b> ' + (percent == 100 ? '已完成': '正在上传...')
          + '<b class="uprogress"> ' + percent + ' %</b></span>';
        $progress.html(html).show();
      },

      uploadSuccess: function(wfile, data) {
        if( data.errCode ) {
          showMessage(data.errMsg);
        }
        else {
          showMessage($wrap.data('msg') || data.errMsg || '上传成功', 'upload-success');
        }
      },

      uploadError: function(wfile, errMsg) {
        //console.log('uploadError', errMsg);
        changePickStatus(selector, true);
        showMessage(errMsg);
      },

      uploadComplete: function() {
        //console.log('uploadComplete');
        changePickStatus(selector, true);
        this.reset();
      },

      uploadFinished: function() {
        //console.log('uploadFinished');
        changePickStatus(selector, true);
        this.reset();
      }
    };

    // 绑定事件
    $.each(uploaderEvt, function(i, evt) {
      uploader.on(evt, (function(evtName) {
        var handler = evtConf[evtName];
        var userHandler = opts[evtName] || opts['on' + ucFirst(evt)];
        return function() {
          handler && handler.apply(uploader, arguments);
          userHandler && userHandler.apply(uploader, arguments);
        };
      })(evt));
    });

    return uploader;
  };

})(jQuery, document);
