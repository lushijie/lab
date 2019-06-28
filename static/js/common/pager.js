/*
* @Author: lushijie
* @Date:   2016-11-29 17:37:07
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-21 16:32:49
*/
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






