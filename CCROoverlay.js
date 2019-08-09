var CCROsettings = {}; //Initialize the CCROsettings object

//Save CCRO overlay settings into the CCROsettings cookie
function CCROsaveSettings() {
	CCROcreateCookie("CCROsettings",CCROsettings,3650);
}

//Opens the CCRO overlay UI
function CCROopen() {
	$.getScript('https://mjbeisch.github.io/ccro-bookmarklet/CCROcookieFunctions.min.js', function() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://mjbeisch.github.io/ccro-bookmarklet/CCRObookmarklet.min.css"><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP" crossorigin="anonymous">');

		//Check for presence of CCROsettings cookie
		if( CCROreadCookie('CCROsettings') ) {
			CCROsettings = CCROcookies.getJSON( 'CCROsettings' ); //get the EOS UI settings from the eosvalidator cookie
		}

		//if there is no data set in the CCROoverlay cookie, initialize CCROsettings object with base settings
		else {
			CCROsettings = { 
				toggle: 1
			};

			CCROsaveSettings();
		}

		CCROrenderValidationUI();
	});
}

//Closes the CCRO overlay UI
function CCROclose() {
	CCROexpireCookie('CCROsettings');

	//Remove the overlay UI
	$(".CCROoverlayui").remove();
}

//Toggles the CCRO overlay UI
function CCROtoggle() {
	if( CCROsettings.toggle == 1 ) {
		CCROsettings.toggle = 0;

		$(".CCROoverlayui").addClass('collapsed');

		$('.CCROv-toggle .fa-minus').addClass('fa-plus').removeClass('fa-minus');
	}

	else { 
		CCROsettings.toggle = 1;

		$(".CCROoverlayui").removeClass('collapsed');

		$('.CCROv-toggle .fa-plus').addClass('fa-minus').removeClass('fa-plus');
	}

	CCROsaveSettings();
}

//Mark an experiment as active in the CCRO overlay UI
function CCROmarkActiveExperiment(experimentID) {
	var experimentSelector = $( "#experiment-" + experimentID );

	$( "#experiment-" + experimentID ).addClass("active");
}

//Draw the CCRO overlay UI
function CCROrenderValidationUI() {
	var CCROvalidationCookieCheck = '', //Initialize CCRO cookie checkbox check
		convertVariationCookie = CCROreadCookie('_conv_v'), //grab data in Convert variation cookie
		experiments = window.convert.data.experiments, //grab experiment object from Optimizely API
		experimentIds = Object.keys(experiments), //grab experiment Ids from Optimizely API
		activeExperiments = window.convert.currentData.experiments, //grab active experiments from Optimizely API
		activeExperimentIds = Object.keys(activeExperiments), //grab active experiment Ids
		experimentLoop = 0, //Initialize experiment loop iterator
		activeStateLoop = 0; //Initialize targeting loop

	//Check for presence of CCROvalidation cookie
	if( CCROreadCookie('CCROvalidation') ) {
		CCROvalidationCookieCheck = 'checked';
	}

	//Clear old UI
	$(".CCROoverlayui").remove();

	//Draw base UI continer elements
	$("body").append('<div class="CCROoverlayui"><div class="CCROoverlayOptions">Validation Cookie <label class="CCROswitch CCROsetcookie"><input type="checkbox" ' + CCROvalidationCookieCheck + '><span class="CCROslider CCROround"></span></label></div><div class="CCROoverlayuiscroll"><div class="CCROoverlayuicontent"></div></div><div class="CCROv-header"><div class="CCROv-ui-buttons"><button class="CCROv-toggle CCROv-button"><i class="fas fa-minus"></i></button><button class="CCROv-close CCROv-button"><i class="fas fa-times"></i></button></div><h2>Corvus CRO Experiment Overlay</h2></div></div>');

	//Check CCRO UI toggle state
	if( CCROsettings.toggle == 0 ) {
		$(".CCROoverlayui").addClass('collapsed');
	}

	//Check if the experiment ID object contains anything
	if ( experimentIds.length > 0 ) {
		//Draw experiment list table container element
		$(".CCROoverlayuicontent").append("<table class=\"experimentlist\"><caption>Experiment List</caption><thead><tr><th class=\"experiment-name\">Experiment Name</th><th class=\"variations\">Variations</th><!--<th class=\"results-link\">Results</th>--></tr></thead><tbody></tbody></table>");

		//Loop through experiment Ids
		for (; experimentLoop < experimentIds.length; ++experimentLoop) {
			var experimentId = experimentIds[experimentLoop], //Get experiment Id for current iteration through loop
				experimentName = experiments[experimentId].n, //Get experiment name
				experimentVariations = experiments[experimentId].vars, //Get variations for experiment
				experimentVariationIds = Object.keys(experimentVariations), //Get variation IDs from experimentVariations object
				variationLoop = 0, //Initialize variation loop iterator
				variationOptions = ""; //Initialize variation options HTML container

			//Loop through this experiments variations
			for (; variationLoop < experimentVariationIds.length; ++variationLoop) {
				var variationId = experimentVariationIds[variationLoop], //Get variation Id for current iteration through loop
					variationName = experimentVariations[variationId].name; //Get variation name

				//Check if the variation has a name (value of "null" for name means it is a personalization experiment and variation shouldn't be an option in the select dropdown)
				if( variationName != null ) {
					if( convertVariationCookie.indexOf(variationId) != -1 ) {
						variationOptions += "<option value=\"" + variationId + "\" selected>" + variationName + "</option>";
					}
					else {
						variationOptions += "<option value=\"" + variationId + "\">" + variationName + "</option>";
					}
				}
			}

			//Build list item HTML for experiment
			$(".CCROoverlayui .experimentlist").append("<tr id=\"experiment-" + experimentId + "\"><td class=\"experiment-name\"><i class=\"fas fa-circle\"></i> " + experimentName + "</td><td class=\"variations\"><select id=\"" + experimentId + "\">" + variationOptions + "</select></td><!--<td class=\"results-link\"><a class=\"CCROv-button\" href=\"#\" target=\"_blank\">View Results</a></td>--></tr>" );
		}

		//Mark active experiments
		for (; activeStateLoop < activeExperimentIds.length; ++activeStateLoop) {
			CCROmarkActiveExperiment(activeExperimentIds[activeStateLoop]);
		}

		//Initialize page reload functionality for variation select elements
		$(".experimentlist .variations select").change(function(event) {
			var selectedExperiment = $(this).attr("id"),
				selectedVariation = $(this).val(),
				newURL =  window.location.protocol + "//" + window.location.host + window.location.pathname;

			//Check for presence of query strings
			if( window.location.search ) {
				//Check if Convert variation forcing query string is present
				if( window.location.search.indexOf("convert_action=convert_vpreview") != -1 ) {
					var currentSearch = window.location.search.split(/convert_action=convert_vpreview&convert_v=\d+&convert_e=\d+/);

					newURL = newURL + currentSearch[0] + "convert_action=convert_vpreview&convert_v=" + selectedVariation + "&convert_e=" + currentSearch[1] + window.location.hash;
				}
				else {
					newURL = newURL + "&convert_action=convert_vpreview&convert_v=" + selectedVariation + "&convert_e=" + selectedExperiment + window.location.hash;
				}
			}
			else {
				newURL = newURL + "?convert_action=convert_vpreview&convert_v=" + selectedVariation + "&convert_e=" + selectedExperiment + window.location.hash;
			}

			window.location = newURL;
		});
	}

	else {
		$(".CCROoverlayuicontent").append("<p>There are currently no experiments built for this site.</p>");
	}

	//Initialize CCROvalidation cookie toggle slider functionality
	$('.CCROsetcookie input').change(function() {
		if( $(this).is(':checked') ) {
			CCROcreateCookie('CCROvalidation','active',1);
		}
		else {
			CCROexpireCookie('CCROvalidation');
		}
	});

	//Initialize CCRO UI close button functionality
	$(".CCROv-close").click(function() {
		CCROclose();
	});

	//Initialize CCRO UI toggle button functionality
	$(".CCROv-toggle").click(function() {
		CCROtoggle();
	});

	//Check if 'ccroqc' query string is set to active and toggle on validation cookie
	if( window.location.href.indexOf('ccroqc=active') > 0 ) {
        CCROcreateCookie('CCROvalidation','active',1);

        $('.CCROsetcookie input').prop('checked');
  	};
}

if ( window.$ === undefined ) {
	(function() {
		// Load the script
		var script = document.createElement("SCRIPT");
		
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
		
		script.type = 'text/javascript';
		
		script.onload = function() {
			var $ = window.jQuery;
			
			CCROopen();
		};

		document.getElementsByTagName("head")[0].appendChild(script);
	})();
}

else { 
	CCROopen();
}