// 依赖 jquery与jquery-ui
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
