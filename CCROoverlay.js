var CCROsettings = {}; //Initialize the CCROsettings object

//Save a cookie
function CCROsetCookie(name,value,time,period) {
	var expires = "";

	if (time) {
		var date = new Date();
		if(period == 's') {
			time = time*1000;
		}
		else if(period == 'm') {
			time = time*1000*60;
		}
		else if(period == 'h') {
			time = time*1000*60*60;
		}
		else {
			time = time*1000*60*60*24;
		}

		date.setTime(date.getTime() + time);

		expires = "; expires=" + date.toUTCString();
	}
	
	document.cookie = name + "=" + ( ( encodeURIComponent(value) ) || "")  + expires + "; path=/";
}

//Read a cookie
function CCROreadCookie(name) {
	var nameEQ = name + "=",
		ca = document.cookie.split(';');

	for(var i=0;i < ca.length;i++) {
		var c = ca[i];

		while (c.charAt(0)==' ') c = c.substring(1,c.length);

		if (c.indexOf(nameEQ) == 0) return ( decodeURIComponent(c.substring(nameEQ.length,c.length) ) );
	}
	return null;
}

//Expire a cookie
function CCROexpireCookie(name) {
	document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

//Get JS Object key value from a variable path
function CCROgetValueByPath(JSobject, path) {
	if (!JSobject || !path) return undefined;
  
	const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');

	let current = JSobject;

	for (const key of keys) {
		if (current[key] !== undefined) {
			current = current[key];
		}
		else {
			return undefined;
		}
	  }

	  return current;
}

//Save CCRO overlay settings into the CCROsettings cookie
function CCROsaveSettings() {
	CCROsetCookie("CCROsettings",JSON.stringify(CCROsettings),3650);
}

//Opens the CCRO overlay UI
function CCROopen() {
	jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://mjbeisch.github.io/ccro-bookmarklet/CCRObookmarklet.min.css">');

	//Check for presence of CCROsettings cookie
	if( CCROreadCookie('CCROsettings') ) {
		CCROsettings = JSON.parse( CCROreadCookie('CCROsettings') ); //get the EOS UI settings from the eosvalidator cookie
	}

	//if there is no data set in the CCROoverlay cookie, initialize CCROsettings object with base settings
	else {
		CCROsettings = {
				toggle: 1
		};

		CCROsaveSettings();
	}

	CCROrenderValidationUI();
}

//Closes the CCRO overlay UI
function CCROclose() {
	CCROexpireCookie('CCROsettings');

	CCROexpireCookie('CCROvalidation');

	//Remove the overlay UI
	jQuery(".CCROoverlayui").remove();
}

//Toggles the CCRO overlay UI
function CCROtoggle() {
	if( CCROsettings.toggle == 1 ) {
		CCROsettings.toggle = 0;

		jQuery(".CCROoverlayui").addClass('collapsed');

		jQuery('.CCROv-toggle').text('+');
	}

	else { 
		CCROsettings.toggle = 1;

		jQuery(".CCROoverlayui").removeClass('collapsed');

		jQuery('.CCROv-toggle').text('-');
	}

	CCROsaveSettings();
}

//Mark an experiment as active in the CCRO overlay UI
function CCROmarkActiveExperiment(experimentID) {
	var experimentSelector = jQuery( "#experiment-" + experimentID );

	jQuery( "#experiment-" + experimentID ).addClass("active");

	jQuery( "#" + experimentID ).prop("disabled", false);
}

function CCRORenderConvertExperimentList(experiments,activeExperiments,experimentNameKey,experimentVariationsKey,experimentVariationIdKey) {
	var CCROvalidationCookieCheck = '', //Initialize CCRO cookie checkbox check
			ConvertVariationCookie = CCROreadCookie('_conv_v'), //grab data in Convert variation cookie
			experimentList = Object.keys(experiments), //grab experiment list
			activeexperimentList = Object.keys(activeExperiments), //grab active experiment experiments
			experimentLoop = 0, //Initialize experiment loop iterator
			activeStateLoop = 0; //Initialize targeting loop

		//Check if the experiment ID object contains anything
	if ( experimentList.length > 0 ) {
		//Draw experiment list table container element
		jQuery(".CCROoverlayuicontent").append("<table class=\"experimentlist\"><caption>Convert Experiences Experiment List</caption><thead><tr><th class=\"experiment-name\">Experiment Name</th><th class=\"variations\">Variations</th><!--<th class=\"results-link\">Results</th>--></tr></thead><tbody></tbody></table>");

		//Loop through experiment Ids
		for (; experimentLoop < experimentList.length; ++experimentLoop) {
			var experiment = experimentList[experimentLoop], //Get single experiment for current iteration through loop
				experimentId = experiments[experiment].id //Get experiment ID
				experimentName = experiments[experiment][experimentNameKey], //Get experiment name
				experimentVariations = experiments[experiment][experimentVariationsKey], //Get variations for experiment
				experimentVariationIds = Object.keys(experimentVariations), //Get variation IDs from experimentVariations object
				variationLoop = 0, //Initialize variation loop iterator
				variationOptions = ""; //Initialize variation options HTML container

			//Loop through this experiments variations
			for (; variationLoop < experimentVariationIds.length; ++variationLoop) {
				var variationId = experimentVariationIds[variationLoop], //Get variation Id for current iteration through loop
					variationName = experimentVariations[variationId].name; //Get variation name

				if( experimentVariationIdKey ) {
					variationId = CCROgetValueByPath( experimentVariations[variationId], experimentVariationIdKey );
				}

				//Check if the variation has a name (value of "null" for name means it is a personalization experiment and variation shouldn't be an option in the select dropdown)
				if( variationName != null ) {
					if( ConvertVariationCookie.indexOf(variationId) != -1 ) {
						variationOptions += "<option value=\"" + variationId + "\" selected>" + variationName + "</option>";
					}
					else {
						variationOptions += "<option value=\"" + variationId + "\">" + variationName + "</option>";
					}
				}
			}

			//Build list item HTML for experiment
			jQuery(".CCROoverlayui .experimentlist").append("<tr id=\"experiment-" + experimentId + "\"><td class=\"experiment-name\"><span class=\"CCRO-active-circle\"></span> " + experimentName + "</td><td class=\"variations\"><select disabled id=\"" + experimentId + "\">" + variationOptions + "</select></td><!--<td class=\"results-link\"><a class=\"CCROv-button\" href=\"#\" target=\"_blank\">View Results</a></td>--></tr>" );
		}

		//Mark active experiments
		for (; activeStateLoop < activeexperimentList.length; ++activeStateLoop) {
			CCROmarkActiveExperiment(activeexperimentList[activeStateLoop]);
		}

		//Initialize page reload functionality for variation select elements
		jQuery(".experimentlist .variations select").change(function(event) {
			if( !event.originalEvent ){
				return;
			}

			var selectedExperiment = jQuery(this).attr("id"),
				selectedVariation = jQuery(this).val();
				//newURL =  window.location.protocol + "//" + window.location.host + window.location.pathname;

			window._conv_q = window._conv_q || [];
			window._conv_q.push(['assignVariation',selectedExperiment,selectedVariation]);
			window._conv_q.push(["executeExperiment",selectedExperiment]);
			window.location.reload(true);

			/*
			//Check for presence of query strings
			if( window.location.search ) {
				//Check if Convert variation forcing query string is present
				if( window.location.search.indexOf("convert_action=convert_vpreview") != -1 ) {
					var currentSearch = window.location.search.split(/convert_action=convert_vpreview&convert_v=\d+&convert_e=\d+/);

					newURL = newURL + currentSearch[0] + "convert_action=convert_vpreview&convert_v" + selectedVariation + "&convert_e" + currentSearch[1] + window.location.hash;
				}
				else {
					newURL = newURL + "&convert_action=convert_vpreview&convert_v" + selectedVariation + "&convert_e" + selectedExperiment + window.location.hash;
				}
			}
			else {
				newURL = newURL + "?convert_action=convert_vpreview&convert_v" + selectedVariation + "&convert_e" + selectedExperiment + window.location.hash;
			}

			window.location = newURL;
			*/
		});
	}

	else {
		jQuery(".CCROoverlayuicontent").append("<p>There are currently no Convert Experiences experiments built for this site.</p>");
	}
}

//Draw the CCRO overlay UI
function CCROrenderValidationUI() {
	var CCROvalidationCookieCheck = ''; //Initialize CCRO cookie checkbox check

	//Check if 'ccroqc' query string is set to active and toggle on validation cookie
	if( window.location.href.indexOf('ccroqc=active') > 0 ) {
		CCROsetCookie('CCROvalidation','active',1);
	}

	//Check for presence of CCROvalidation cookie
	if( CCROreadCookie('CCROvalidation') ) {
		CCROvalidationCookieCheck = 'checked';
	}

	//Clear old UI
	jQuery(".CCROoverlayui").remove();

	//Draw base UI continer elements
	jQuery("body").append('<div class="CCROoverlayui"><div class="CCROv-header"><h2>Corvus CRO Experiment Overlay</h2></div><div class="CCROoverlayuiscroll"><div class="CCROoverlayuicontent"></div></div><div class="CCROoverlayOptions"><div class="CCROv-ui-buttons"><button class="CCROv-toggle CCROv-button">-</button><button class="CCROv-close CCROv-button">x</button></div><label class="CCROswitch CCROsetcookie"><input type="checkbox" ' + CCROvalidationCookieCheck + '><span class="CCROslider CCROround"></span></label>QC Mode</div></div>');

	//Check CCRO UI toggle state
	if( CCROsettings.toggle == 0 ) {
		jQuery(".CCROoverlayui").addClass('collapsed');
	}

	//Initialize CCROvalidation cookie toggle slider functionality
	jQuery('.CCROsetcookie input').change(function(event) {
		if( !event.originalEvent ){
			return;
		}
		if( jQuery(this).is(':checked') ) {
			CCROsetCookie('CCROvalidation','active',1);
		}
		else {
			CCROexpireCookie('CCROvalidation');
		}
		window.location.reload(true);
	});

	//Initialize CCRO UI close button functionality
	jQuery(".CCROv-close").click(function() {
		CCROclose();
	});

	//Initialize CCRO UI toggle button functionality
	jQuery(".CCROv-toggle").click(function() {
		CCROtoggle();
	});

	//Check for Convert Experiences JS object V3 and render Convert module if present
	if( window.convert.data.experiments ) {
		CCRORenderConvertExperimentList(window.convert.data.experiments, window.convert.currentData.experiments,"n","vars");
	}
	//Check for Convert Experiences JS object V4 and render Convert module if present
	else if( window.convert.data.experiences ) {
		CCRORenderConvertExperimentList(window.convert.data.experiences, window.convert.currentData.experiences,"name","variations","id");
	}
}

if ( window.jQuery === undefined ) {
	(function() {
		// Load the script
		var script = document.createElement("SCRIPT");
		
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
		
		script.type = 'text/javascript';
		
		script.onload = function() {      
			CCROopen();
		};

		document.getElementsByTagName("head")[0].appendChild(script);
	})();
}

else {
	CCROopen();
}