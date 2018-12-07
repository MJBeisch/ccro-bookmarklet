function CCROinit() {
	$.getScript('https://corvuscro.com/js/CCROcookieFunctions.min.js', function() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://corvuscro.com/css/CCRObookmarklet.min.css">');

		var CCROcookieCheck = '';

		if( CCROreadCookie('CCROvalidation') ) {
			CCROcookieCheck = 'checked';
		}

		$("body").append('<div class="CCROvalidatorui"><div class="CCROvalidatoruiscroll"><div class="CCROvalidatoruicontent">Validation Cookie <label class="CCROswitch CCROsetcookie"><input type="checkbox" ' + CCROcookieCheck + '><span class="CCROslider CCROround"></span></label></div></div><div class="CCROv-header"><!--<div class="CCROv-ui-buttons"><button class="CCROv-toggle CCROv-button"></button><button class="CCROv-close CCROv-button">X</button></div>--><h2>Corvus CRO Experiment Overlay</h2></div></div>');

		$('.CCROsetcookie input').change(function() {
			if( $(this).is(':checked') ) {
		    	CCROcreateCookie('CCROvalidation','active',1);
		    	console.log('checked');
		   	}
		   	else {
		   		CCROexpireCookie('CCROvalidation');
		   		console.log('unchecked');
		   	}
		});
	});
}

if ( window.$ === undefined ) {
    (function() {
	    // Load the script
	    var script = document.createElement("SCRIPT");
	    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
	    script.type = 'text/javascript';
	    script.onload = function() {
	        var $ = window.jQuery;
	        
	        CCROinit();
	    };
	    document.getElementsByTagName("head")[0].appendChild(script);
	})();
}

else { 
	CCROinit();
}