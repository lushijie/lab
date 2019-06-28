/*
* @Author: lushijie
* @Date:   2016-11-28 18:48:55
* @Last Modified by:   lushijie
* @Last Modified time: 2017-01-06 15:26:04
*/
$(function(){
  $(document.body).delegates({

  });

  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js').then(function(registration) {
        console.log('service worker 注册成功');
    }).catch(function (err) {
        console.log('servcie worker 注册失败')
    });
  }

});
