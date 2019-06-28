/*
* @Author: lushijie
* @Date:   2016-11-28 18:48:55
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-21 17:38:04
*/
$(function(){
  $(document.body).delegates({
    // tab事件
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

  // 分页组件
  var pager1 = new $.Pager('.sj-pager1', {
    currentPage: 1,
    totalPage: 10
  });

  pager1.listen('onPageChanged', function(event, data) {
    console.log(data);
  });

  // 日期组件
  $('#jqTimePicker1').datetimepicker({
    dayOfWeekStart : 1,
    value: moment().format('YYYY-MM-DD H:mm:ss'),
    format: 'Y-m-d H:i:s',
    minDate:'2013/12/03',
    maxDate:'2017/3/03',
    startDate: new Date(), //'1987/12/03'
    //value: moment().format('YYYY-MM-DD'),
    //timepicker: false,
    //step: 10
    // onSelectDate: function(ct,$input){
    //   console.log(moment(ct).format('YYYY-MM-DD H:mm:ss'));
    //   $input.datetimepicker('hide');
    // },
    // onSelectTime: function(current_time,$input){
    //   console.log(moment(current_time).format('YYYY-MM-DD H:mm:ss'));
    //   $input.datetimepicker('hide');
    // },
    // onShow: function(current_time,$input){
    //   console.log('show');
    // },
    // onClose: function(current_time,$input){
    //   console.log('hide');
    // },
    closeOnDateSelect: true,
    //opened: true,
  });

  // art Template
  $('#tableTbody').html(art('tableTbodyTmpl', {}));

  // chosen 组件
  var chosenList = $.chosen(['scan-interval','vdb-update'],{
    conf:{
      width:'77px'
    },
    events:{
      onchange:function(evt,selected){
        console.log(selected);
      }
    }
  });

  console.log(chosenList);

});
