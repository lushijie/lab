$(function() {
  // tooltip
  // $(document.body).tooltip({
  //     position: { my: "left+15 top+15", at: "left center" }
  // });

  // 通用功能
  $(document.body).delegates({
    'label[for]': function(evt) {
      var $el = $(this);
      var $icon = $('#' + $el.attr('for'));
      if( $icon.length <= 0 ) {
          return ;
      }
      var tagName = $icon[0].tagName.toLowerCase();
      var tagList = ['select', 'input', 'textarea'];
      if( $.inArray(tagName, tagList) == -1 ) {
          evt.preventDefault();
          $icon.trigger('click');
      }
    },
    '[data-counter-tips]': {
      'keyup': function(evt) {
        var $el = $(this);
        var val = $.trim($el.val()),
            len = val.length;
        var $count = $($el.attr('data-counter-tips'));
        var rules = $el.rules && $el.rules();
        if( (!val || !len) && rules && !rules.required && rules.maxlength > 0) {
            //return $count.html('最多可以输入 ' + rules.maxlength + ' 个字');
            return $count.html('0/' + rules.maxlength);
        }
        if ( rules && rules.maxlength > 0 && len <= rules.maxlength ) {
            //$count.html('还可以输入 ' + (rules.maxlength - len) + ' 个字');
            $count.html((rules.maxlength - len) + '/' + rules.maxlength);
        }
        //else if(len > rules.maxlength) {
        //   $count.html('输入超出范围');
        //}
      }
    },

    '.scrollable': {
      'DOMMouseScroll mousewheel wheel': function(evt) {
        var $this = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          height = $this.height(),
          delta = (evt.type == 'DOMMouseScroll' ?
            evt.originalEvent.detail * -40 :
            evt.originalEvent.wheelDelta),
          up = delta > 0;

        var prevent = function() {
          evt.stopPropagation();
          evt.preventDefault();
          evt.returnValue = false;
          return false;
        }

        if (!up && -delta > scrollHeight - height - scrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(scrollHeight);
          return prevent();
        } else if (up && delta > scrollTop) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
        }
      }
    }
  });
});
