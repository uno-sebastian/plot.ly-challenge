var url = window.location.href + "/data/samples.json";
var metadata = null;
var samples = null;
var idToDegrees = 0;

// honestly, this is for my ocd :)
if (url.includes("//data/samples.json"))
	url = url.replace("//data/samples.json", "/data/samples.json");

// this is to help test on local instance 
if (url.includes("index.html"))
	url = url.replace("index.html", "");

d3.json(url).then(function (samplesData) {
	samples = samplesData.samples;
	metadata = samplesData.metadata;

	var maxId = 1;
	samples.forEach(sample => {
		var newMaxId = Math.max(sample.otu_ids);
		if (newMaxId > maxId)
			maxId = newMaxId;
	});
	idToDegrees = 0.9 / maxId;

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
				updateBubbleChart(samples[i]);
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
		text: top10OTUsFound.map(object => object.otu_labels.split(";").join("<br>")),
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

function updateBubbleChart(sample) {

	if (sample == null) {
		d3.select("bubble").text("");
		return;
	}

	var data = [{
		x: sample.otu_ids,
		y: sample.sample_values,
		text: sample.otu_labels.map(object => object.split(";").join("<br>")),
		mode: 'markers',
		marker: {
			color: sample.otu_ids.map(object => otuIdToRgb(object)),
			size: sample.sample_values
		}
	}];

	var layout = {
		title: `All Samples for Test Subject ID No. ${sample.id}`
	};

	Plotly.newPlot("bubble", data, layout);
}

function otuIdToRgb(id){
	var color = HSVtoRGB(id * idToDegrees, 1.0, 1.0);
	return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

// https://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v) {
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}