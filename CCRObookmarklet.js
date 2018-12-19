function CCROinit() {
	$.getScript('https://corvuscro.com/js/CCROcookieFunctions.min.js', function() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://corvuscro.com/css/CCRObookmarklet.min.css"><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP" crossorigin="anonymous">');

		EOSrenderValidationUI();
	});
}

function EOSrenderValidationUI() {
	var CCROcookieCheck = '', //Initialize CCRO cookie checkbox check
		convertVariationCookie = CCROreadCookie('_conv_v'), //grab data in Convert variation cookie
		experiments = window.convert.data.experiments, //grab experiment object from Optimizely API
		experimentIds = Object.keys(experiments), //grab experiment Ids from Optimizely API
		activeExperiments = window.convert.currentData.experiments, //grab active experiments from Optimizely API
		activeExperimentIds = Object.keys(activeExperiments), //grab active experiment Ids
		experimentLoop = 0, //Initialize experiment loop iterator
		activeStateLoop = 0; //Initialize targeting loop

	//Check for presence of CCROvalidation cookie
	if( CCROreadCookie('CCROvalidation') ) {
		CCROcookieCheck = 'checked';
	}

	//Clear old UI
	$(".CCROvalidatorui").remove();

	//Draw base UI continer elements
	$("body").append('<div class="CCROvalidatorui"><div class="CCROvalidatorOptions">Validation Cookie <label class="CCROswitch CCROsetcookie"><input type="checkbox" ' + CCROcookieCheck + '><span class="CCROslider CCROround"></span></label></div><div class="CCROvalidatoruiscroll"><div class="CCROvalidatoruicontent"></div></div><div class="CCROv-header"><div class="CCROv-ui-buttons"><button class="CCROv-toggle CCROv-button"><i class="fas fa-minus"></i></button><button class="CCROv-close CCROv-button"><i class="fas fa-times"></i></button></div><h2>Corvus CRO Experiment Overlay</h2></div></div>');

	//Check if the experiment ID object contains anything
	if ( experimentIds.length > 0 ) {
		//Draw experiment list table container element
		$(".CCROvalidatoruicontent").append("<table class=\"experimentlist\"><caption>Experiment List</caption><thead><tr><th class=\"experiment-name\">Experiment Name</th><th class=\"variations\">Variations</th><!--<th class=\"results-link\">Results</th>--></tr></thead><tbody></tbody></table>");

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
			$(".CCROvalidatorui .experimentlist").append("<tr id=\"experiment-" + experimentId + "\"><td class=\"experiment-name\"><i class=\"fas fa-circle\"></i> " + experimentName + "</td><td class=\"variations\"><select id=\"" + experimentId + "\">" + variationOptions + "</select></td><!--<td class=\"results-link\"><a class=\"CCROv-button\" href=\"#\" target=\"_blank\">View Results</a></td>--></tr>" );
		}

		//Mark active experiments
		for (; activeStateLoop < activeExperimentIds.length; ++activeStateLoop) {
			$( "#experiment-" + activeExperimentIds[activeStateLoop] ).addClass("active");
		}

		//Initialize page reload functionality for variation select elements
		$(".experimentlist .variations select").change(function(event) {
			selectedExperiment = $(this).attr("id");
			selectedVariation = $(this).val();
			window.location = window.location.protocol + "//" +window.location.host + "?_conv_eforce=" + selectedExperiment + "." + selectedVariation;
		});
	}

	else {
		$(".CCROvalidatoruicontent").append("<p>There are currently no experiments built for this site.</p>");
	}

	//Initialize CCROvalidation cookie toggle slider functionality
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