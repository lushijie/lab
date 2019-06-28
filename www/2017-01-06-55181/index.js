/*
* @Author: lushijie
* @Date:   2016-11-28 18:48:55
* @Last Modified by:   lushijie
* @Last Modified time: 2017-01-06 15:21:15
*/

$(function(){

  function recordNavClassStatus(target) {
    var statusList = [];
    $.each($(target).find('*'), function(index, ele) {
      statusList.push($(ele).attr('class'));
    });
    if(window.localStorage) {
      localStorage.setItem('navClassStatus', statusList.join(','));
    }
  }

  if(window.localStorage && localStorage.navClassStatus) {
    var statusList = localStorage.navClassStatus.split(',');
    $.each($('.level-1').find('*'), function(index, ele) {
      statusList.push($(ele).attr('class', statusList[index]));
    });
  }

  $(document.body).delegates({
    '.level li': function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var target = evt.target;
      if($(target).find('.level').length == 0) {
        console.log('单一节点,执行跳转');
        //window.open
        return;
      }

      //本li的第一层级，类名为level的孩子
      $($(target).find('.level')[0]).toggleClass('level--close');

      //本li同级的其他li的level，这样体验很差，所以注释
      //$(target).siblings('li').find('.level').addClass('level--close');

      recordNavClassStatus('.level-1');
    },

  });


});
