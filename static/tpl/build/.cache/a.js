/*TMODJS:{"version":10,"md5":"bda0b35ec9642b9354b9d10f9e251ac1"}*/
template('a',function($data,$filename
/**/) {
'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,addthousands=$helpers.addthousands,title=$data.title,$out='';$out+='YYYY';
$out+=$escape(addthousands(title));
$out+='YYYYYY ';
return new String($out);
});