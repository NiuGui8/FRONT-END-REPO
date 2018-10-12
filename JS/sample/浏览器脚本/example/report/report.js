
var i = 123455;
var imval = setInterval(function(){
    i ++;
    $(".page_text")[1].click();
	console.info(i);
    if(i >= 124000) {
        clearInterval(imval);
    }
},10);