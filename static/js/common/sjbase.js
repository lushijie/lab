/*
* @Author: lushijie
* @Date:   2017-02-22 17:48:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-22 18:13:57
* 全局依赖jquery 1.xx
* 包含基础封装函数，common处理逻辑，
* 组件包含 tab, tips(依赖font-awesome), dialog(依赖jquery-ui), chosen(依赖chosen_v1.5.1), pager
*/

//-------------------------------------
// base
//-------------------------------------
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

  $.getTrimedObject = function(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        if(typeof(obj[key]) == "string") {
          obj[key] = $.trim(obj[key]);
        }else if($.isPlainObject(obj[key])) {
          $.getTrimedObject(obj[key]);
        }
      }
    }
    return obj;
  };

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

  // 通用功能
  $(document.body).delegates({
    'label[for]': function(evt) {
      var $el = $(this);
      var $icon = $('#' + $el.attr('for'));
      if( $icon.length <= 0 ) {
          return ;
      }
      var tagName = $icon[0].tagName.toLowerCase();
      var tagList = ['select', 'input', 'textarea'];
      if( $.inArray(tagName, tagList) == -1 ) {
          evt.preventDefault();
          $icon.trigger('click');
      }
    },
    '[data-counter-tips]': {
      'keyup': function(evt) {
        var $el = $(this);
        var val = $.trim($el.val()),
            len = val.length;
        var $count = $($el.attr('data-counter-tips'));
        var rules = $el.rules && $el.rules();
        if( (!val || !len) && rules && !rules.required && rules.maxlength > 0) {
            //return $count.html('最多可以输入 ' + rules.maxlength + ' 个字');
            return $count.html('0/' + rules.maxlength);
        }
        if ( rules && rules.maxlength > 0 && len <= rules.maxlength ) {
            //$count.html('还可以输入 ' + (rules.maxlength - len) + ' 个字');
            $count.html((rules.maxlength - len) + '/' + rules.maxlength);
        }
        //else if(len > rules.maxlength) {
        //   $count.html('输入超出范围');
        //}
      }
    },

    '.scrollable': {
      'DOMMouseScroll mousewheel wheel': function(evt) {
        var $this = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          height = $this.height(),
          delta = (evt.type == 'DOMMouseScroll' ?
            evt.originalEvent.detail * -40 :
            evt.originalEvent.wheelDelta),
          up = delta > 0;

        var prevent = function() {
          evt.stopPropagation();
          evt.preventDefault();
          evt.returnValue = false;
          return false;
        }

        if (!up && -delta > scrollHeight - height - scrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(scrollHeight);
          return prevent();
        } else if (up && delta > scrollTop) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
        }
      }
    }
  });

})(jQuery, document);


//-------------------------------------
// common
//-------------------------------------
$(function() {
  // tooltip
  // $(document.body).tooltip({
  //     position: { my: "left+15 top+15", at: "left center" }
  // });

  // 通用功能
  $(document.body).delegates({
    'label[for]': function(evt) {
      var $el = $(this);
      var $icon = $('#' + $el.attr('for'));
      if( $icon.length <= 0 ) {
          return ;
      }
      var tagName = $icon[0].tagName.toLowerCase();
      var tagList = ['select', 'input', 'textarea'];
      if( $.inArray(tagName, tagList) == -1 ) {
          evt.preventDefault();
          $icon.trigger('click');
      }
    },
    '[data-counter-tips]': {
      'keyup': function(evt) {
        var $el = $(this);
        var val = $.trim($el.val()),
            len = val.length;
        var $count = $($el.attr('data-counter-tips'));
        var rules = $el.rules && $el.rules();
        if( (!val || !len) && rules && !rules.required && rules.maxlength > 0) {
            //return $count.html('最多可以输入 ' + rules.maxlength + ' 个字');
            return $count.html('0/' + rules.maxlength);
        }
        if ( rules && rules.maxlength > 0 && len <= rules.maxlength ) {
            //$count.html('还可以输入 ' + (rules.maxlength - len) + ' 个字');
            $count.html((rules.maxlength - len) + '/' + rules.maxlength);
        }
        //else if(len > rules.maxlength) {
        //   $count.html('输入超出范围');
        //}
      }
    },

    '.scrollable': {
      'DOMMouseScroll mousewheel wheel': function(evt) {
        var $this = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          height = $this.height(),
          delta = (evt.type == 'DOMMouseScroll' ?
            evt.originalEvent.detail * -40 :
            evt.originalEvent.wheelDelta),
          up = delta > 0;

        var prevent = function() {
          evt.stopPropagation();
          evt.preventDefault();
          evt.returnValue = false;
          return false;
        }

        if (!up && -delta > scrollHeight - height - scrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(scrollHeight);
          return prevent();
        } else if (up && delta > scrollTop) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
        }
      }
    },
    '.sj-tab__nav__li': function(evt) {
      $(this).addClass('sj-tab__nav__li--active')
        .siblings('.sj-tab__nav__li')
        .removeClass('sj-tab__nav__li--active');

      $(this).parents('.sj-tab__nav')
        .next('.sj-tab__content')
        .find('> .sj-tab__content__sub')
        .removeClass('sj-tab__content__sub--active')
        .end()
        .find('> .sj-tab__content__sub:eq('+ $(this).index() +')')
        .addClass('sj-tab__content__sub--active')
    }
  });
});


//-------------------------------------
// chosen
//-------------------------------------
;(function($, document, undefined) {
  $.chosen = function(selector, options) {
    var opts = {
      placeholder: '请选择',
      selectItems: [], // {value: , text: }
      selectHtml: '', // selectHtml配置等级高于items
      conf: {
        disable_search: true,
        width: '216px'
      },
      events: {
        onChange: function(evt, selected) {
          selected.target = $(evt.target);
          console.log(selected);
        }
      }
    }
    opts = $.extend(true , opts, options||{});

    var self = {};
    //可以同时初始化多个，不过配置文件暂使用相同，主要给那些默认配置的多个初始化
    if (!$.isArray(selector)) {
      selector = selector.split();
    }

    $.each(selector, function(index, ele) {
      var $wrap = $('#' + ele);

      var selectHtml = '<option value=""></option>';
      if (opts.selectItems && opts.selectItems.length > 0) {
        $.each(opts.selectItems, function(index, ele) {
          var selected = ele.selected ? 'selected' : '';
          selectHtml += '<option value=' + ele.value + ' ' + selected + '>' + ele.text + '</option>';
        });
        $wrap.html(selectHtml);
      }

      // selectHtml 配置优先
      if (opts.selectHtml) {
        $wrap.html(opts.selectHtml);
      }

      //placeholder
      $wrap.attr('data-placeholder', opts.placeholder);

      // 解决首屏跳动的问题
      $wrap.trigger("chosen:open");
      $wrap.trigger("chosen:close");

      var c = $wrap.on('chosen:ready', function(e, chosen) {
      }).chosen(opts.conf);

      // onChange
      if (opts.events && opts.events.onChange) {
        $wrap.on('change', opts.events.onChange);
      }

      //支持下拉框在上部显示
      if ($wrap.hasClass('chosen-with-drop-up')) {
        $('#' + ele + '+.chosen-container').addClass('chosen-with-drop-up');
      }

      $wrap.on('chosen:showing_dropdown', function(evt, params) {
        // chosen-with-drop-up,位置修正
        if ($wrap.hasClass('chosen-with-drop-up')) {
          var chosenDropHeight = $('#' + ele + '+.chosen-container .chosen-drop').height();
          var chosenContainerHeight = $('#' + ele + '+.chosen-container').height();
          var chosenOffset = 0 - chosenDropHeight - chosenContainerHeight + 3 + 'px';
          $('#' + ele + '+.chosen-with-drop-up .chosen-drop').css('margin-top', chosenOffset);
        }
      });
      self[ele] = c;
    });
    return self;
  };

})(jQuery, document);


//-------------------------------------
// dialog
//-------------------------------------
;(function($, document, undefined) {
  // 基本对话框
  $.dialog = function(conf) {
    var uniqueClass = conf.dialogClass && conf.dialogClass.replace(/\s(\w)|^(\w)/g, ' .$1$2').replace(/\s*/g,'');
    if(conf.dialogClass && /uid-\s*/.test(conf.dialogClass) && $(uniqueClass).length > 0){
      $(uniqueClass + ' .ui-dialog-titlebar-close').trigger('click');
    }

    conf = $.extend({}, {
      title: '标题',
      width: 500,
      height: 250,
      modal: true,
      resizable: false,
      closeText: '关闭',
      open: false,
      hide: false,

      // 直接销毁
      close: function() {
        $(this).dialog('destroy').remove();
        //fix 点击详情，编辑关闭弹窗之后 详情tooltip重现的问题
        //$('a').blur();
      },
      open: function() {
        //防止“mod-search”初始获取焦点
        //$(this).parent().focus();
        //设备管理详情滚动到顶部位置
        //$(this).find('.mod-panel-cont').scrollTop(0);
      },
      // show: {
      //  effect: 'fade',
      //  duration: 300
      // },
      // hide: {
      //  effect: 'fade',
      //  duration: 200
      // }
      // ,
      // open: function(evt, ui) {
      //  var that = this;
      //  var $dialog = $(that).parents('.ui-dialog');
      //  var $overlay = $dialog.siblings('.ui-widget-overlay');
      //  var $close = $dialog.find('.ui-icon-closethick');

      //  $overlay.hide().fadeIn();
      //  $close.bind('click.close', function (evt) {
      //    $overlay.fadeOut(200, function() {
      //      $close.unbind('click.close').trigger('click');
      //    });
      //    return false;
      //  });
      // }
    }, conf || {});

    var cls = 'dialog-tj ' + conf.dialogClass;
    conf.dialogClass = cls;
    conf.content = '<div class="dialog-tj-content">' + (conf.content || '') + '</div>';

    var buttons = conf.buttons || [];
    if( conf.interval && /^\d+$/g.test(conf.interval) ) {
      $.each(buttons, function(i, button){
        var click = button.click;
        button.click = function(evt){
          var btn = $(evt.currentTarget);
          btn.prop('disabled', true);
          btn.addClass('ui-state-disabled');
          setTimeout(function(){
            btn.prop('disabled', false);
            btn.removeClass('ui-state-disabled');
          }, conf.interval );
          click && click.call(this, event);
        };
        buttons[i] = button;
      });
    }
    conf.buttons = buttons;

    return $(conf.content).dialog(conf);
  };

  // 确认框
  $.confirm = function(conf, callback1, callback2) {
    if( typeof conf === 'string' ) {
      conf = { content:  conf };
    }
    conf = conf || {};
    var okstate = true;
    if( conf.okButtonEnable !== undefined ) {
       okstate = !!conf.okButtonEnable;
    }

    conf = $.extend(true, {
      title: '确认',
      width: 500,
      height: 250,
      buttons: [{
        'text': conf.okButtonText || '确认',
        'id': conf.okButtonId || ('ok_' + new Date().getTime()),
        'class': 'ui-button-ok',
        'disabled': !okstate,
        'click': function(evt) {
          callback1 && callback1.call(null, $(this));
          !callback1 && $(this).dialog('close');
        }
      },{
        'text': conf.cancelButtonText || '取消',
        'id': conf.cancelButtonId || ('cancel_' + new Date().getTime()),
        'click': function() {
          callback2 && callback2.call(null, $(this));
          !callback2 && $(this).dialog('close');
        }
      }]
    }, conf);

    conf.dialogClass = 'dialog-tj-confirm ' + (conf.dialogClass || '') ;
    return $.dialog(conf);
  };

  // 提示框
  $.alert = function(conf, flag, callback) {
    if($.isFunction(flag)) {
      callback = flag;
      flag = false;
    }
    if(!flag && !callback && flag !== false) {
      flag = conf;
    }

    if( typeof conf === 'string' ) {
      conf = { content: conf };
    }
    conf = conf || {};
    conf = $.extend(true, {
      title: '提示',
      width: 500,
      height: 250,
      buttons: [{
        'text': conf.buttonText || flag ? '确认' : '关闭',
        'id': conf.buttonId || (flag ? 'ok_' : 'cancel_' + new Date().getTime()),
        'class': flag ? 'ui-button-ok' : '',
        'click': function(evt) {
          callback && callback.call(null, $(this));
          !callback && $(this).dialog('close');
        }
      }]
    }, conf);
    conf.dialogClass = 'dialog-tj-alert ' + (conf.dialogClass || '') ;
    return $.dialog(conf);
  };

  // popup 提示框
  $.popup = function(el, conf, callback) {
    if( typeof conf === 'string' ) {
      conf = { content: conf };
    }
    conf = conf || {};
    conf = $.extend(true, {
      title: '提示',
      width: 500,
      height: 250,
      position: {
        my: 'center top',
        at: 'center bottom', of: el
      },
      buttons: [{
        'text': conf.buttonText || '确认',
        'class': 'ui-button-ok',
        'click': function(evt) {
          callback && callback.call(null, $(this));
        }
      }, {
        'text': '取消',
        'click': function(evt) {
          $(this).dialog('close');
        }
      }]
    }, conf);
    conf.dialogClass = 'dialog-tj-popup ' + (conf.dialogClass || '') ;
    return $.dialog(conf);
  };

  // 设置按钮状态
  $.enableButton = function(el, enable) {
    var $el = $(el);
    $el.button(enable ? 'enable' : 'disabled');
  };
})(jQuery, document);


//-------------------------------------
// pager
//-------------------------------------
;(function($, document, undefined) {
  var Pager = function(el, options) {
    this.run(el, options);
  }
  Pager.prototype = {
    init: function() {
      var that = this;
      var $wrap = that.$wrap;

      // default options
      that.pars = {
          currentPage: 1,
          totalPage: 1,
          pagePad: 2,
          pageSize: 10,
          pageSizeSelect: [10, 20, 50, 100],
          preText: '前一页',
          nextText: '后一页',
          firstText: '首页',
          lastText: '尾页',
          showPageSizeSelect: true,
          showPreNext: true,
          showFirstLast: true,
          pageClass: 'sj-pager__normal',
          preClass: 'sj-pager__pre',
          nextClass: 'sj-pager__next',
          firstClass: 'sj-pager__first',
          lastClass: 'sj-pager__last',
          pageSizeClass: 'sj-pager__pagesize'
      };

      // 根据页面配置或者js中的初始化参数复写当前的options
      // js中优先级高于页面中的配置
      $.each(that.pars, function(key, val) {
          var dataVal = $wrap.data(key);
          if( typeof dataVal != 'undefined' ) {
              that.pars[key] = dataVal;
          }
          if(that.options[key]) {
            that.pars[key] = that.options[key];
          }
      });

      // 根据options计算而来的附加项
      that.pars.currentPage = parseInt(that.pars.currentPage, 10);
      that.pars.totalPage = parseInt(that.pars.totalPage, 10);
      that.pars.pageSize = parseInt(that.pars.pageSize, 10);
      that.pars.pageRange = 2 * that.pars.pagePad + 5;
      that.pars.currentClass = that.pars.pageClass + '--current';
      that.pars.disabledClass = that.pars.pageClass + '--disabled';
      that.pars.ellipsisClass = that.pars.pageClass + '--ellipsis';

      // pager容器检测
      if($wrap.length == 0){
        throw Error('The container must be supplied!');
        return;
      }
    },

    render: function() {
      var that = this;
      var pars = that.getParams();

      var innerHTML = '';
      if(pars.showFirstLast && pars.totalPage > pars.pageRange) {
        innerHTML += '<a class="'+ pars.pageClass +' '+ pars.firstClass+'">'+ pars.firstText +'</a>';
      }
      if(pars.showPreNext) {
        innerHTML += '<a class="'+ pars.pageClass +' '+ pars.preClass+'">'+ pars.preText +'</a>';
      }
      var pageList = that.calcPage(pars.currentPage);

      for(var i = 0; i < pageList.length; i++){
        var isCurrent = (pars.currentPage == pageList[i]);
        var isEllipsis = (pageList[i] == '...');
        innerHTML += '<a class="'+ pars.pageClass +' '+ (isCurrent ? pars.currentClass : '') + ' '+ (isEllipsis ? pars.ellipsisClass : '') + '">' + pageList[i] +'</a>';
      }
      if(pars.showPreNext) {
        innerHTML += '<a class="'+ pars.pageClass +' '+ pars.nextClass+'">'+ pars.nextText +'</a>';
      }
      if(pars.showFirstLast && pars.totalPage > pars.pageRange) {
        innerHTML += '<a class="'+ pars.pageClass +' '+ pars.lastClass+'">'+ pars.lastText +'</a>';
      }
      if(pars.showPageSizeSelect) {
        innerHTML += ' 每页显示<select class="'+ pars.pageSizeClass +'">';
        for(var i = 0; i < pars.pageSizeSelect.length; i++){
          innerHTML += '<option value="'+ pars.pageSizeSelect[i] +'">'+ pars.pageSizeSelect[i] +'</option>'
        }
        innerHTML += '</select> 条';
      }
      that.$wrap.html(innerHTML);
      pars.showPageSizeSelect && that.$wrap.find('.' + pars.pageSizeClass).val(pars.pageSize);
      that.updatePageStatus();
    },

    bindEvent: function() {
      var that = this;
      var pars = that.getParams();
      $('body').delegate(that.el + ' .' + pars.pageClass, 'click', function(event) {
        if($(this).hasClass(pars.ellipsisClass) || $(this).hasClass(pars.currentClass) || $(this).hasClass(pars.disabledClass)){
          return;
        }
        //$(this).siblings().removeClass(pars.currentClass).end().addClass(pars.currentClass);
        if($(this).hasClass(pars.preClass)) {
          that.setParams({currentPage: parseInt(that.getParams('currentPage'), 10) - 1});
        }else if($(this).hasClass(pars.nextClass)) {
          that.setParams({currentPage: parseInt(that.getParams('currentPage'), 10) + 1});
        }else if($(this).hasClass(pars.firstClass)) {
          that.setParams({currentPage: 1});
        }else if($(this).hasClass(pars.lastClass)) {
          that.setParams({currentPage: parseInt(that.getParams('totalPage'), 10)});
        }else {
          that.setParams({currentPage: parseInt($(this).text(), 10)});
        }
        that.render();
        that.$wrap.triggerHandler('onPageChanged', [that.getParams()]);
      });

      $('body').delegate(that.el + ' .' + pars.pageSizeClass, 'change', function(event) {
        that.setParams({currentPage: 1, pageSize: parseInt($(this).val())});
        that.render();
        that.$wrap.triggerHandler('onPageChanged', [that.getParams()]);
      });
    },

    // 计算当前应该显示的页码
    calcPage: function(currentPage) {
      var that = this;
      var pars = that.getParams();
      var currentPage = parseInt(currentPage || pars.currentPage);
      var pars = that.getParams();
      var pageList = [];
      if(pars.totalPage < pars.pageRange) {
        for(var i = 1; i <= pars.totalPage; i++){
          pageList.push(i);
        }
        return pageList;
      }

      var leftPageNum = rightPageNum = 0;
      var frontList = [], endList = [];

      // 计算前、后部分占位个数
      leftPageNum = Math.min(currentPage - 1, pars.pagePad + 2);
      rightPageNum = pars.pageRange - leftPageNum - 1;

      // 后半部分占位过多，补充到前半部分
      if(rightPageNum > (pars.totalPage - currentPage)) {
        rightPageNum = rightPageNum - (rightPageNum - (pars.totalPage - currentPage));
        leftPageNum = pars.pageRange - rightPageNum - 1;
      }

      //倒数第二个为...
      for(var i = 0; i <= leftPageNum; i++) {
        if(i == leftPageNum - 1) {
          frontList.unshift('...');
        }else {
          frontList.unshift( currentPage - i);
        }
      }

      //倒数第二个为...
      for(var i = 1; i <= rightPageNum; i++) {
        if(i == rightPageNum - 1) {
          endList.push('...');
        }else {
          endList.push( currentPage + i);
        }
      }

      //前半部分...处理
      var frontEllipsisPos = frontList.indexOf('...');
      if(frontEllipsisPos > -1) {
        if(frontList[frontEllipsisPos -1] == 1) {
          frontList[frontEllipsisPos] = 2;
        }else {
          frontList[frontEllipsisPos -1] = 1;
        }
      }

      //后半部分...处理
      var endEllipsisPos = endList.indexOf('...');
      if(endEllipsisPos > -1) {
        if(endList[endEllipsisPos + 1] == pars.totalPage) {
          endList[endEllipsisPos] = pars.totalPage - 1;
        }else {
          endList[endEllipsisPos + 1] = pars.totalPage;
        }
      }

      return (frontList.concat(endList));
    },

    updatePageStatus: function() {
      var that = this;
      var pars = that.getParams();
      that.$wrap.find('.' + pars.preClass + ', .' + pars.firstClass)[pars.currentPage == 1 ? 'addClass' : 'removeClass'](pars.disabledClass);
      that.$wrap.find('.' + pars.nextClass + ', .' + pars.lastClass)[pars.currentPage >= pars.totalPage ? 'addClass' : 'removeClass'](pars.disabledClass);
    },

    setParams: function(pars) {
        var that = this;
        that.pars = $.extend(that.pars || {}, pars) ;
    },

    getParams: function(key) {
        var that = this;
        var params = $.extend({}, that.pars);
        if( !(key = $.trim(key)) ) {
            return params;
        }
        var keys = key.split('.'), i = 0 ;
        while( keys[i] ) {
            params = params[keys[i++]] || {};
        }
        return params;
    },

    listen: function(event, cb){
      var that = this;
      that.$wrap.unbind(event);
      that.$wrap.on(event, function(event, data) {
        cb(event ,data);
      })
    },

    run: function(el, options) {
      if(!el) return;
      this.$wrap = $(el);
      this.el = el;
      this.options = options;
      this.init();
      this.render();
      this.bindEvent();
    }
  }

  $.Pager = Pager;
}(jQuery, document));
