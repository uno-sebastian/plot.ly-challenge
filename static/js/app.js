var url = window.location.href + "/data/samples.json";

// honestly, this is for my ocd :)
if (url.includes("//data/samples.json"))
	url = url.replace("//data/samples.json", "/data/samples.json");

// this is to help test on local instance 
if (url.includes("index.html"))
	url = url.replace("index.html", "");

d3.json(url).then(function (samplesData) {
	var metadata = samplesData.metadata;
	var names = samplesData.names;
	var samples = samplesData.samples;

	console.log(names);
	console.log(samples);
	console.log(metadata);
});


// <div class="col-md-2">
// 	<div class="well">
// 	<h5>Test Subject ID No.:</h5>
// 	<select id="selDataset" onchange="optionChanged(this.value)"></select>
// 	</div>
// 	<div class="panel panel-primary">
// 	<div class="panel-heading">
// 		<h3 class="panel-title">Demographic Info</h3>
// 	</div>
// 	<div id="sample-metadata" class="panel-body"></div>
// 	</div>
// </div>

//Plotly.newPlot("bar", barData, barLayout);
//Plotly.newPlot("bubble", barData, barLayout);