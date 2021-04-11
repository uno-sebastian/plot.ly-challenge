var url = window.location.href + "/data/samples.json";
var metadata = null;
var names = null;
var samples = null;

// honestly, this is for my ocd :)
if (url.includes("//data/samples.json"))
	url = url.replace("//data/samples.json", "/data/samples.json");

// this is to help test on local instance 
if (url.includes("index.html"))
	url = url.replace("index.html", "");

d3.json(url).then(function (samplesData) {
	metadata = samplesData.metadata;
	samples = samplesData.samples;

	addSelectionOptions(samplesData.names);

	console.log(samples);
	console.log(metadata);
});

function addSelectionOptions(names) {
	var body = d3.select("#selDataset");
	// add in the "nothing selected" option
	body.append("option").attr("selected");
	//<option value="NAME">NAME</option>
	body.selectAll("option")
		.data(names)
		.enter()
		.append("option")
		.attr("value", data => data)
		.text(data => data);
}

// Function called by DOM changes
function optionChanged() {
	var body = d3.select("#sample-metadata");
	body.text("");
	if (metadata == null) return;
	var sample = +d3.select("#selDataset").property("value");
	if (sample == null) return;
	var length = metadata.length;
	var i;
	for (i = 0; i < length; i++)
		if (sample === metadata[i].id) {
			body.append("h5").text(`id: ${metadata[i].id}`);
			body.append("h5").text(`ethnicity: ${metadata[i].ethnicity}`);
			body.append("h5").text(`gender: ${metadata[i].gender}`);
			body.append("h5").text(`age: ${metadata[i].age}`);
			body.append("h5").text(`location: ${metadata[i].location}`);
			body.append("h5").text(`bbtype: ${metadata[i].bbtype}`);
			body.append("h5").text(`wfreq: ${metadata[i].wfreq}`);
			break;
		}
}

//Plotly.newPlot("bar", barData, barLayout);
//Plotly.newPlot("bubble", barData, barLayout);