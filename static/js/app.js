var url = window.location.href + "/data/samples.json";
var metadata = null;
var samples = null;

// honestly, this is for my ocd :)
if (url.includes("//data/samples.json"))
	url = url.replace("//data/samples.json", "/data/samples.json");

// this is to help test on local instance 
if (url.includes("index.html"))
	url = url.replace("index.html", "");

d3.json(url).then(function (samplesData) {
	samples = samplesData.samples;
	metadata = samplesData.metadata;
	addSelectionOptions(samplesData.names);
});

function addSelectionOptions(names) {
	var body = d3.select("#selDataset");
	//<option value="NAME">NAME</option>
	body.selectAll("option")
		.data(names)
		.enter()
		.append("option")
		.attr("value", data => data)
		.text(data => data);

	optionChanged();
}

// Function called by DOM changes
function optionChanged() {
	var value = d3.select("#selDataset").property("value");

	d3.select("selected").remove();

	if (samples != null) {
		var length = samples.length;
		var i;
		for (i = 0; i < length; i++)
			if (value == samples[i].id) {
				updateBarChart(samples[i]);
				break;
			}
	}

	if (metadata != null) {
		var length = metadata.length;
		var i;
		for (i = 0; i < length; i++)
			if (value == metadata[i].id) {
				updateSelectionTable(metadata[i]);
				break;
			}
	}
}

function updateSelectionTable(metadata) {

	var body = d3.select("#sample-metadata");

	body.text("");

	if (metadata == null) return;

	body.append("h5").text(`id: ${metadata.id}`);
	body.append("h5").text(`ethnicity: ${metadata.ethnicity}`);
	body.append("h5").text(`gender: ${metadata.gender}`);
	body.append("h5").text(`age: ${metadata.age}`);
	body.append("h5").text(`location: ${metadata.location}`);
	body.append("h5").text(`bbtype: ${metadata.bbtype}`);
	body.append("h5").text(`wfreq: ${metadata.wfreq}`);
}

function updateBarChart(sample) {

	if (sample == null) {
		d3.select("bar").text("");
		return;
	}

	var top10OTUsFound = sortTop10OTUsFound(sample);

	var data = [{
		x: top10OTUsFound.map(object => object.sample_values),
		y: top10OTUsFound.map(object => `OTU ${object.otu_ids}`),
		text: top10OTUsFound.map(object => object.otu_labels.split(";").join(", ")),
		type: "bar",
		orientation: "h"
	}];

	var layout = {
		title: "Top 10 OTUs Found",
	};

	Plotly.newPlot("bar", data, layout);
}

function sortTop10OTUsFound(sample) {

	var sorted = [];

	var length = sample.sample_values.length;
	var i;
	for (i = 0; i < length; i++)
		sorted.push({
			otu_ids: sample.otu_ids[i],
			otu_labels: sample.otu_labels[i],
			sample_values: sample.sample_values[i]
		});

	sorted = sorted.sort((a, b) => b.sample_values - a.sample_values);

	if (length > 10)
		sorted = sorted.slice(0, 10);

	sorted = sorted.reverse();

	return sorted;
}

//Plotly.newPlot("bubble", barData, barLayout);