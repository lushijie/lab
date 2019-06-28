/*
 * @Author: lushijie
 * @Date:   2016-05-09 14:34:05
 * @Last Modified by:   lushijie
 * @Last Modified time: 2017-02-21 17:45:13
 */
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
