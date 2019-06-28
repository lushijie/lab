/** validator基本配置 */
;(function($, document, undefined) {
  // http://jqueryvalidation.org/category/plugin/
  // http://jqueryvalidation.org/category/methods/
  // http://jqueryvalidation.org/reference/

  // 1. 设置默认配置
  $.validator.setDefaults({
    debug: true,

    ignore: ':hidden,.form-ignore',

    // focusCleanup: true,

    // errorClass: 'error',

    // ok class or fn, default valid
    validClass: 'form-valid-ok',

    // // 错误信息使用label元素
    // errorElement: 'label',

    // // 使用div包装错误信息
    // wrapper: '',

    // // 实现输入ok 后提示隐藏功能
    // errorContainer: '',

    // // 所有输出展示在同一容器内
    // errorLabelContainer: '',

    // 验证方式
    onfocusout: function(el) {
    $(el).valid();
    },
    onkeyup: function(el) {
    if( $(el).data('keyupTrigger') ){
      $(el).valid();
    }
    },

    // // 替换默认的表单提交
    // submitHandler: function(form) {
    //  console.log('ok', arugments);
    // },

    // 调用$(form).valid() 后，valid不ok时执行
    // invalidHandler: function(event, validator) {
    //  console.log('not ok');
    // },

    // // 自定义错误展示
    // showErrors: function(errorMap, errorList) {
    //  console.log('show error', arguments);
    // },

    // 自定义错误展示位置：前提 - 未启用showErrors
    errorPlacement: function(error, element) {
      var $errorWrap = $(element.data('errorPlacement'));
      $(error).addClass('valid-rule-error');
      if( $errorWrap.length > 0 ) {
        $errorWrap.html(error);
      } else {
        // 默认错误
        element.after(error);
      }
    }

    // // custom ruels
    // rules: {
    //   contact: {
    //      required: true,
    //      email: {
    //      depends: function(element) {
    //          return $('#use_email:checked')
    //      }
    //      }
    //   }
    // },
    // // custom messages
    // messages: {
    //  name: {
    //    required: '请输入密码',
    //    rangelength: jQuery.format('请输入{0}-{1}位密码')
    //   }
    // }
  });

  // 2. 可以直接使用data-rule-xxxx 和 data-msg-xxx来配置验证规则
  // 具体如何配置：http://johnnycode.com/2014/03/27/using-jquery-validate-plugin-html5-data-attribute-rules/
  function passwordCheck(password){
    var valid = false;
    var matchNum = 0;
    /\d/.test(password) && matchNum++;
    /[A-Z]/.test(password) && matchNum++;
    /[a-z]/.test(password) && matchNum++;
    /[!@#$%^&*()_+=\-,.\/\\{}\[\]?><:"|`~';]/.test(password) && matchNum++;
    if(matchNum >= 2 && password.length >= 8 && password.length <= 30){
      valid = true;
    }
    if(/\s/.test(password)){
      valid = false;
    }
    return valid;
  }

  $.validator.addMethod('alphanum', function(val, el, param) {
    val = $.trim(val);
    return (/[a-zA-Z]/.test(val) && /[0-9]/.test(val));
  }, '必须同时包含数字和字母');

  $.validator.addMethod('ascii', function(val, el, param) {
    val = $.trim(val);
    return !/[^\x00-\xff]/.test(val);
  }, '密码只能包含ASCII字符');

  $.validator.addMethod('phoneValid', function(val, el, param) {
    val = $.trim(val);
    return val &&
      val.length >= param[0] && val.length <= param[1] &&
      (!/[^\d]/.test(val));
  }, function(param, el) {
    return $.validator.format('请输入{0}-{1}位数字', param);
  });

  // 域名和IP地址验证
  $.validator.addMethod('domain', function(val, el, param) {
    val = $.trim(val);
    if( !val ) { return true; }
    var ipv4Reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    // var ipv6Reg = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;
    var domainReg = /^([a-zA-Z\d]|([a-zA-Z\d][a-zA-Z\d\-]{0,20}[a-zA-Z\d]))(\.([a-zA-Z\d]|([a-zA-Z\d][a-zA-Z\d\-]{0,20}[a-zA-Z\d])))*(\.[a-zA-Z]{2,10})$/;
    return (ipv4Reg.test(val) || domainReg.test(val)) && val.length <= 67;
  }, function(param, el) {
    return '请输入合法的IP地址和域名';
  });

  // 端口配置
  $.validator.addMethod('port', function(val, el, param) {
    var isDigits = $.validator.methods.digits.call(this, val, el);
    val = parseInt(val, 10);
    return isDigits && val > 0 && val <= 65535;
  }, function(param, el) {
    return '请输入合法的端口';
  });

   // 特殊用户名检测
  $.validator.addMethod('formatuser', function(val, el, param) {
    var regx = /^((?!(\/|\\|'|"|&|:|\?|\*|<|>)).)*$/;
    return regx.test(val);
  }, function(param, el) {
    return '请不要包含特殊字符';
  });

  //特殊密码验证
  $.validator.addMethod("passwdValid", function (value, el) {
    value = $(el).val();
    value = $.trim(value);
    return passwordCheck(value);
  }, function (value, el) {
    return "密码由8-30个字符组成，必须包含数字、大写字母、小写字母和特殊符号中的任意两种组合且不包含空格";
  });

  // 3. 自定义validator
  // $.validator.addMethod('hello', function(val, el, param) {
  //  // val not trim , el id dom
  //  return false;
  // }, function(param, el) {
  //  // console.log(arguments);
  //  return '';
  // });

  // 4. $.validator.addMethod('cRequired', $.validator.methods.required, 'Customer name required');

  // 5. jQuery.validator.methods.email.call(this, value, element)
})(jQuery, document);
