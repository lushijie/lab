;(function($, document, undefined) {
  if (!window.console){ console = {log: function() {}}; };

  // csrf
  //var csrfParam = 'meta[name="csrf-param"]';
  //var csrfToken = 'meta[name="csrf-token"]';

  /**
   * 提示展示
   * @param  {[type]} msg   [description]
   * @param  {[type]} success [description]
   * @param  {[type]} time  [description]
   * @return {[type]}     [description]
   */
  $.tips = function(msg, success, time) {
    if (typeof success === 'number') {
      time = success;
      success = false;
    }
    success = success || false;

    var html = '<div class="tips clearfix tips-' + (success ? 'success': 'warning') + '">'
        + '<i class="tips-icon fa fa-' + (success ? 'check-circle-o': 'warning') + '"></i>'
        + '<span class="tips-txt">' + msg + '</span>'
        + '<i class="tips-close fa fa-close"></i>'
      + '</div>',

      $tips = $(html).appendTo(document.body),
      fadeOut = function() {
        $tips.fadeOut(350, function() {
          $tips.remove();
        });
      };

    if (/msie 6.0/i.test(navigator.userAgent)) {
      $tips.css('top', document.documentElement.scrollTop + 90);
    }

    setTimeout(fadeOut, time || 3000);

    $tips.show().on('click', '.tips-close', function(evt) {
      evt.preventDefault();
      fadeOut.call();
    });
  };
  /**
   * blockUI
   * @param  {[type]} msg [description]
   * @return {[type]}   [description]
   */
  $.blockUI = function(msg) {
    var html = '<div class="blockui"></div>'
      + '<div class="blockui-msg">' + msg + '</div>';
    return $(html).appendTo(document.body);
  };
  /**
   * unblockUI
   * @param  {[type]} inst [description]
   * @return {[type]}    [description]
   */
  $.unblockUI = function(inst) {
    inst && $(inst).remove();
    (!inst) && $('.blockui:last, .blockui-msg:last').remove();
  };

  /**
   * 将json变为uri参数
   * @param  {[type]} json [description]
   * @return {[type]}    [description]
   */
  $.encodeURIJSON = function (json){
    var s = [];
    for( var p in json ){
      // 删除掉参数, $.param 则是返回空， 如：
      // var a = {a: undefined, b: 1, c: null} -> a=&b=1
      if(json[p]==null) {
        continue;
      }
      if(json[p] instanceof Array) {
        for (var i=0;i<json[p].length;i++) {
          s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
        }
      } else {
        s.push( (p) + '=' + encodeURIComponent(json[p]));
      }
    }
    return s.join('&');
  };

  // 获取 URL 和 hash 的值, 设置相关的初始值
  // data-init-key = 'id', 获取的id值
  // data-init-from = ['url' | 'hash'] 获取来源
  // data-init-to = ['text'| 'html' | 'val', 'attr_name'] 赋值到
  $.setInitialValue = function(url, elements) {
    url = url || location.href;
    var target = '[data-init-key]';
    if($.isArray(elements)) {
      // 此时 url 不能省略
      target = elements.join(',')
    }
    $.each($(target), function(index, ele) {
      $ele = $(ele);
      var name = $ele.attr('data-init-key');
      var source = $ele.attr('data-init-from') || 'url';
      var type = $ele.attr('data-init-to') || 'val';
      var val = (source === 'url') ? $.queryURL(url, name) : $.changeHash()[name];
      try{
        if(type.indexOf('attr_') === 0) {
          $ele.attr(type.split('_')[1], val);
        }else {
          $ele[type](val);
        }
      }catch(e) {
        console.warn('setInitialValue Error!');
      }
    });
  }

  /**
   * [padNum 自动补0]
   * @param  {[type]} num [description]
   * @param  {[type]} n   [description]
   * @return {[type]}   [description]
   */
  $.padNum = function(num, n) {
    var len = num.toString().length;
    while(len < n) {
      num = "0" + num;
      len++;
    }
    return num;
  }

  // 解析uri里的参数
  $.queryURL = function (url, key) {
    url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
    var json = {};
    // 考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
    url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
      // 对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
      try {
        key = decodeURIComponent(key);
      } catch(e) {}
      try {
        value = decodeURIComponent(value);
      } catch(e) {}

      if ( !(key in json) ) {
        json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
      } else if (json[key] instanceof Array) {
        json[key].push(value);
      } else {
        json[key] = [json[key], value];
      }
    });
    return key ? json[key] : json;
  };

  // $.getURLPath = function(){
  //   var url = location.protocol + '//' + location.hostname;
  //   if ( location.port != '80' ) {
  //     url += ':' + location.port;
  //   }
  //   url += location.pathname;
  //   return url;
  // };

  // getAbsoluteURL('') 可获取当前页绝对路径
  $.getAbsoluteURL = function() {
    var a;
    return function(url) {
      if(!a) a = document.createElement('a');
      a.href = url;
      return a.href;
    };
  };

  // $.getTrimedObject = function(obj) {
  //   for(var key in obj) {
  //     if(obj.hasOwnProperty(key)) {
  //       if(typeof(obj[key]) == "string") {
  //         obj[key] = $.trim(obj[key]);
  //       }else if($.isPlainObject(obj[key])) {
  //         $.getTrimedObject(obj[key]);
  //       }
  //     }
  //   }
  //   return obj;
  // };
  //obj = {name: 'lushijie'}
  //mapNameList = ['name:name1']
  $.mapFormName = function(obj, mapNameList) {
    var tmp = $.extend({}, obj);
    $.each(mapNameList, function(index, ele) {
      if(ele && ele.split) {
        var originName = ele.split(':')[0];
        var destName = ele.split(':')[1];
        if(originName && destName) {
          tmp[destName] = tmp[originName];
          delete tmp[originName];
        }
      }
    })
    return tmp;
  }

  $.getTrimedObject = function(data) {
    if(typeof data === 'string') {
      return $.trim(data);
    }else if(Object.prototype.toString.call(data) === '[object Object]') {
      for(var key in data) {
        if(data.hasOwnProperty(key)) {
          data[key] = this.getTrimedResult(data[key]);
        }
      }
      return data;
    }else if(Object.prototype.toString.call(data) === '[object Array]') {
      return $.map(data, function(ele){
        return this.getTrimedResult(ele);
      });
    }else {
      return data;
    }
  }

  // 修改URL的hash $.changeHash也会触发onhashchange事件
  $.changeHash = function(json) {
    json = json || {};
    var hash = (location.hash || "#").substr(1);
    var obj = $.queryUrl(hash);
    // 属性为 undefined 值无法覆盖，因此想要删除，必须设置为null
    obj = $.extend(obj, json);
    // $.param(obj)
    var hash = $.encodeURIJSON(obj);
    // 无用的hash change
    if( location.hash != hash && location.hash != '#'+hash ) {
      // Firefox 和 ie 在hash为undefined时返回url#
      location.hash = hash;
    }
    return obj;
  };

  /**
   * debounce 操作
   */
  $.debounce = function(fn, time, ctx) {
    var ret = 0;
    if( typeof time !== 'number' ) {
      ctx = time;
      time =  50;
    }
    time = time || 50;
    return function() {
      var args = [].slice.apply(arguments);
      // 注意是ctx的问题
      // 错误写法：ctx = ctx || this
      var nctx = ctx || this;
      clearTimeout(ret);
      ret = setTimeout(function() {
        fn.apply(nctx, args);
      }, time);
    };
  };
  /**
   * throttle 操作
  */
  $.throttle = function(fn, time, ctx) {
    if( typeof time !== 'number' ) {
    ctx = time;
    time =  50;
    }
    time = time || 50;
    var isLocked = false;
    return function() {
    var args = [].slice.apply(arguments);
    var nctx = ctx || this;
    var timer;
    if( !isLocked ) {
      isLocked = true;
      fn.apply(nctx, args);
      timer = setTimeout(function(){isLocked = false;},time);
    }
    };
  };

  $.addThousands = function(value, count) {
    var valueadd;
    if (value == '--') {
    valueadd = '--';
    } else {
    valueadd = (Number(value).toFixed(count) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
    }
    return valueadd;
  };

  $.numSlowGrow = function (selector,value,addthousands,withString){
    $(selector).prop('Counter', 0).animate({
      Counter: value
    },{
      duration: 1200,
      easing: 'swing',
      step: function(now) {
        if(addthousands) {
          $(selector).text($.addThousands(now));
        }else {
         $(selector).text(Number(now).toFixed(2) + (withString ? withString : ''));
        }
      }
    });
  };

  $.getContinueDateFormat = function (DateList, sp) {
    sp = sp || '至';
    var sortedDateList = DateList.sort(function(a, b) {
    if( isNaN(new Date(a).getTime()) || isNaN(new Date(b).getTime()) ){
      throw new Error('传入的日期不合法');
    }
    return new Date(a) - new Date(b);
    });

    // 去重复处理
    for(var m = 0; m < sortedDateList.length; m++) {
      if( new Date(sortedDateList[m]).getTime() == new Date(sortedDateList[m+1]).getTime() ) {
        sortedDateList.splice(m,1);
      }
    }

    var seriesdDate = [];
    for(var i = 0; i < sortedDateList.length; i++) {
      var beforeDate = sortedDateList[i-1] ? new Date(sortedDateList[i-1]).getTime() : 0,
        currDate  = new Date(sortedDateList[i]).getTime(),
        afterDate = sortedDateList[i+1] ? new Date(sortedDateList[i+1]).getTime() : 0,
        oneDay = 24*60*60*1000;
      if( currDate == (beforeDate + oneDay) && currDate == (afterDate - oneDay) ) {
        // 多个连续日期，中间的连续日期使用 sp 替换(如果前一个为 sp 则不再 push)
        if(seriesdDate.slice(-1) != sp){
        seriesdDate.push(sp);
        }
      }else {
        if( currDate == (beforeDate + oneDay) && currDate != (afterDate - oneDay) ) {
        // 两连续连续日期，在它们之间添加一个 sp
        if(seriesdDate.slice(-1) != sp){
          seriesdDate.push(sp);
        }
        seriesdDate.push(sortedDateList[i]);
        }else {
        //不连续直接 push
        seriesdDate.push(sortedDateList[i]);
        }
      }
    }
    // sp 拼接处理
    for(var j = 0; j <= seriesdDate.length; j ++) {
      if(seriesdDate[j] == sp) {
        seriesdDate[j-1] = seriesdDate[j-1] + sp + seriesdDate[j+1];
        seriesdDate.splice(j, 2);
      }
    }

    return seriesdDate;
  };

  /**
   * 网络请求 get / post
   */
  ;(function() {
    // 通用逻辑处理
    var commonLogicHandler = function(data, textStatus, jqXHR) {
      if ( data && data.errCode == 310) {
        //$.tips('记录不存在');
      }
    };

    // 通用网络请求
    $.request = function(url, method, data, blockMsg, stopTrim) {
      var deferred = $.Deferred();
      var blockInst = null;

      if ( !$.isPlainObject(data) ) {
        stopTrim = blockMsg;
        blockMsg = data;
        data = {};
      }

      if(typeof(stopTrim) == 'undefined') {
        data = $.getTrimedObject(data);
      }

      blockInst = blockMsg && $.blockUI(blockMsg) || '';
      $.ajax({
        url: url ,
        method: method || 'get',
        dataType: 'json',
        data: data || {},
        statusCode: {
          404: function() {}
        }
      }).then(function(data, textStatus, jqXHR) {
        // 通用逻辑处理
        commonLogicHandler.call(null, data, textStatus, jqXHR);
        // errCode 不为0 时 返回错误
        if ( data && data.errCode ) {
          deferred.reject(data);
        } else {
          deferred.resolve(data);
        }
      }, function(jqXHR, textStatus, errorThrown) {
        if( jqXHR.readyState != 0){
          // ajax 请求错误
          var ajaxError = { errCode: 1,  errMsg: '未知错误' };
          switch(textStatus) {
            case 'timeout':
              ajaxError = { errCode: 1,  errMsg: '请求超时' };
              break;
            case 'error':
              ajaxError = { errCode: 2,  errMsg: '请求错误' };
              break;
            case 'abort':
              ajaxError = { errCode: 3,  errMsg: '请求终止' };
              break;
            default:
              break;
          }
          deferred.reject(ajaxError);
        }
      }).always(function() {
        blockMsg && $.unblockUI(blockInst);
      });
      return deferred;
    };

    // get
    $.getJSON2 = function(url, data, blockMsg, stopTrim) {
      data = data || {};
      data.r = Math.random();
      blockMsg = true === blockMsg ? '获取数据...': blockMsg;
      return $.request(url, 'get', data, blockMsg, stopTrim).then(function(data) {
        return data;
      });
    };

    // post
    $.postData = function(url, data, blockMsg, stopTrim) {
      blockMsg = true === blockMsg ? '正在保存...': blockMsg;
      data = data || {};
      //data[$(csrfParam).attr('content')] = $(csrfToken).attr('content');
      return $.request(url, 'post', data, blockMsg, stopTrim);
    };

    // post with error tips
    $.postTip = function(url, data, blockMsg, stopTrim, stopTrim) {
      return $.postData(url, data, blockMsg, stopTrim).then(function(data) {
        return data;
      }, function(err) {
        $.tips(err.errMsg);
      });
    };
  })();

  $.fn.getFormItemsByName = function(prefix){
    //prefix 可以有效防止获取到无用的数据
    //不通过val()读取的数据之后看情况处理，或者通过prefix过滤掉出来，单独读取并附加到返回数据上
    prefix = prefix || '';
    var res = {};
    var reg = prefix == '' ? "[name]" : "[name^='"+prefix+"']";
    $(this[0]).find(reg).each(function(i,k){
      res[$(k).attr('name').slice(prefix.length)]=$(k).val();
    });
    return res;
  };

  // 序列化表单为对象
  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };


  /**
   * 基于配置的事件代理
   */
  $.fn.delegates = function(configs) {
    el = $(this[0]);
    for(var name in configs){
      var value = configs[name];
      if (typeof value == 'function') {
        var obj = {};
        obj.click = value;
        value = obj;
      };
      for(var type in value){
        if( type != 'click' ) {
          el.delegate(name, type, value[type]);
          continue;
        }
        el.delegate(name, type, (function(fn, name){
          return function(evt){
            var me = $(this);

            if( me.data('double-click') == '1' ) {
              return false;
            }
            // 延时设置 解决绑定多个 click 事件问题
            var setRet = setTimeout(function(){
              me.data('double-click', 1);
            }, 15);

            // 超时设置 500ms 后重置状态
            var resetRet = setTimeout(function(){
              me.data('double-click', 0);
            }, 500);

            $.when(fn.call(this, evt)).always(function(){
              clearTimeout(setRet);
              clearTimeout(resetRet);

              me.data('double-click', 0);
            });
          };
        })( value[type], name) );
      }
    }
    return this;
  };

  //Object.keys polyfill
  if (!Object.keys) {
    Object.keys = (function() {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
          toString: null
        }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

      return function(obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [],
          prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }

  // forEach polyfill
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
      var T, k;
      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }
      var O = Object(this);
      var len = O.length >>> 0;
      if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
      }
      if (arguments.length > 1) {
        T = thisArg;
      }
      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  // 例子：
  // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
  // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
  Date.prototype.Format = function (fmt) { //author: meizz
      var o = {
          "M+": this.getMonth() + 1, //月份
          "d+": this.getDate(), //日
          "h+": this.getHours(), //小时
          "m+": this.getMinutes(), //分
          "s+": this.getSeconds(), //秒
          "q+": Math.floor((this.getMonth() + 3) / 3), //季度
          "S": this.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
  }

})(jQuery, document);
