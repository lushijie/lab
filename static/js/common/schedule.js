/*
* @Author: lushijie
* @Date:   2016-12-01 13:48:10
* @Last Modified by:   lushijie
* @Last Modified time: 2016-12-12 18:49:45
*/
;(function($, document, undefined){
  var Schedule = function(el, options) {
    this.run(el, options);
  }
  Schedule.prototype = {
    init: function() {
      var that = this;
      var $wrap = that.$wrap;

      that.pars = {
          step: 2,
          yaxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      };

      $.each(that.pars, function(key, val) {
          var dataVal = $wrap.data(key);
          if( typeof dataVal != 'undefined' ) {
              that.pars[key] = dataVal;
          }
          if(that.options[key]) {
            that.pars[key] = that.options[key];
          }
      });

      if(24 % that.pars.step != 0){
        throw Error('时间间隔必须能够被24整除');
        return;
      }

      if($wrap.length == 0){
        throw Error('必须提供可用容器');
        return;
      }
    },

    render: function() {
      var that = this;
      var pars = that.getParams();

      var stepLen = 24/pars.step;
      var innerHTML = '<table class="sj-schedule"><tbody><tr>';
      //显示数字
      for(var i = 0; i < stepLen + 2; i++) {

        if(i == 0) {
          innerHTML += '<td class="yaxis"></td>';
        } else if(i <= 24) {
          innerHTML += '<td class="xaxis">'+  pars.step*(i-1) +'</td>';
        }
      }
      innerHTML += '</tr>';
      //显示行
      $(pars.yaxis).each(function(index, ele) {
        innerHTML += '<tr class="row"><td class="yaxis" data-value="'+ index +'">'+ ele+'</td>';
        for(var i=0; i<stepLen; i++) {
          innerHTML += '<td data-value="'+ i*(pars.step)+ '-' + (i+1) *(pars.step) +'"></td>';
        }
        innerHTML += "</tr>";
      });
      innerHTML += '</tbody>';
      that.$wrap.html(innerHTML);
    },

    bindEvent: function() {
      var that = this;
      var pars = that.getParams();

      // $('body').delegate(that.el + ' td', 'click', function(event) {
      //   if($(this).hasClass('yaxis') || $(this).hasClass('xaxis')){
      //     return;
      //   }
      //   $(this).toggleClass('active');
      //   that.$wrap.triggerHandler('onTdClick', [that.getSelected()]);
      // });

      $(document).mouseup(function () {
        if(that.isMouseDown) {
          that.$wrap.triggerHandler('onTdClick', [that.getSelected()]);
        }
        that.isMouseDown = false;
      });

      $('body').delegate(that.el + ' td', 'mousedown mouseover', function(event) {
        if(event.type == "mousedown" && !$(this).hasClass('xaxis') && !$(this).hasClass('yaxis')) {
          that.isMouseDown = true;
          $(this).toggleClass('active');
          that.isHighlighted = $(this).hasClass('active');
          return false;
        }
        else if(event.type == 'mouseover') {
          if(that.isMouseDown && !$(this).hasClass('xaxis') && !$(this).hasClass('yaxis')) {
            //$(this).toggleClass('active');
            //$(this).toggleClass('active', that.isHighlighted);
            $(this)[that.isHighlighted ? 'addClass' : 'removeClass']('active');
          }
        }
      });
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

    getSelected: function() {
      var that = this;
      var pars = that.getParams();

      var selected = [];
      $(that.el + ' .row').each(function(index, ele){
        var tmp = [];
        $($(this).find('td.active')).each(function(index2, ele2){
          // tmp.push($(this).data('value'));
          var d = $(this).data('value').split('-');
          for(var i = parseInt(d[0]); i <= parseInt(d[1]); i++) {
            tmp.push(i);
          }
        });
        selected.push(tmp);
      });
      //tramsform
      selected.unshift(selected[selected.length-1]);
      selected.splice(selected.length-1, 1);
      return selected;
    },

    selectWeekDay: function() {
      var that = this;
      var pars = that.getParams();

      that.removeAllSelected();
      $(that.el + ' .row').slice(0,5).find('td').each(function(index, ele) {
        if($(this).hasClass('yaxis')){
          return;
        }
        $(this).addClass('active');
        return that.getSelected();
      });
    },

    selectWeekenDay: function() {
      var that = this;
      var pars = that.getParams();

      that.removeAllSelected();
      $(that.el + ' .row').slice(-2).find('td').each(function(index, ele) {
        if($(this).hasClass('yaxis')){
          return;
        }
        $(this).addClass('active');
      });
      return that.getSelected();
    },

    selectAllDay: function() {
      var that = this;
      var pars = that.getParams();

      $(that.el + ' .row td').each(function(index, ele) {
        if($(this).hasClass('yaxis')){
          return;
        }
        $(this).addClass('active');
      });
      return that.getSelected();
    },

    removeAllSelected: function() {
      var that = this;
      var pars = that.getParams();

      $(that.el + ' td').removeClass('active');
      return that.getSelected();
    },

    listen: function(event, cb){
      var that = this;
      that.$wrap.on(event, function(event, data) {
        cb(event ,data);
      })
    },

    run: function(el, options) {
      this.el = el;
      this.$wrap = $(el);
      this.options = options;
      this.init();
      this.render();
      this.bindEvent();
      // return this.$wrap;
    }
  }

  $.Schedule = Schedule;
}(jQuery, document));


