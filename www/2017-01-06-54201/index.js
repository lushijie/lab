/*
* @Author: lushijie
* @Date:   2016-11-28 18:48:55
* @Last Modified by:   lushijie
* @Last Modified time: 2017-01-06 15:05:05
*/
$(function(){
  $(document.body).delegates({
    // event
  });

  // todo
  //浏览器不支持css-calc处理
  var adjustNav = $.debounce((function f(arg) {
    arg = arg || {};
    var headerHeight = 50, bdId = '#bd', bdContentId = '#bd-content';
    var bdHeight = Math.max($('body').height() - headerHeight, $(bdContentId).height());
    $(bdId).height(bdHeight);
    return f;
  })(), 10);

  $(window).on('resize', function() {
      adjustNav();
  });


});
