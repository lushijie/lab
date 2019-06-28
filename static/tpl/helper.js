/*
* @Author: lushijie
* @Date:   2016-11-28 12:52:31
* @Last Modified by:   lushijie
* @Last Modified time: 2016-11-28 12:52:45
*/
template.helper('addthousands', function(value, count) {
  var valueadd;
  if (value == '--') {
    valueadd = '--';
  } else {
    valueadd = (value.toFixed(count) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
  }

  return valueadd;
});
