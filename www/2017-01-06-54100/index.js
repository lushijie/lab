/*
* @Author: lushijie
* @Date:   2016-11-28 18:48:55
* @Last Modified by:   lushijie
* @Last Modified time: 2017-01-06 15:02:52
*/
$(function(){
  $(document.body).delegates({
    // event
  });

  // todo


  //浏览器不支持css-calc处理
  var adjustNav = (function f(arg) {
    arg = arg || {};
    var headerHeight = 50, navId = '#nav';
    // $(navId).css({height: '100%'});
    // $(navId).height($(navId).height() - headerHeight);
    $(navId).height($('body').height() - headerHeight);
    return f;
  })();

  $(window).on('resize', function() {
      adjustNav();
  });

});
