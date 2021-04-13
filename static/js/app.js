// grab the url by using the current webpage location
var url = window.location.href + "/data/samples.json";
// save the values as null initially so we can check against them if they are not loaded.
var metadata = null;
var samples = null;
// this is the otu id to degree's (thru multiplication)
var otuIdToDegrees = 0;

// honestly, this is for my ocd :)
if (url.includes("//data/samples.json"))
	url = url.replace("//data/samples.json", "/data/samples.json");

// this is to help test on local instance 
if (url.includes("index.html"))
	url = url.replace("index.html", "");

// use the d3 url function to grab the samples json d
d3.json(url).then(function (samplesData) {
	// grab the data first
	samples = samplesData.samples;
	metadata = samplesData.metadata;
	// grab the max otu id by iterating and updating max
	var maxId = 1;
	samples.forEach(sample => {
		var newMaxId = Math.max(sample.otu_ids);
		if (newMaxId > maxId)
			maxId = newMaxId;
	});
	// set the max as 90% of 360 degrees so starting color looks diff from ending color.
	otuIdToDegrees = 0.9 / maxId;
	// add the selection options 
	addSelectionOptions(samplesData.names);
});

/**
 * adds the names to the list of options in the html
 * @param {array list of all the possible names} names 
 */
function addSelectionOptions(names) {
	// select the body where we will append the options
	var body = d3.select("#selDataset");
	//<option value="NAME">NAME</option>
	body.selectAll("option")
		// add the names data
		.data(names)
		// submit the data
		.enter()
		// append any new options per the data
		.append("option")
		// add an attribute called value with the names element as it's value
		.attr("value", data => data)
		// add the element's value as the raw text
		.text(data => data);

	// fire the options changed so the first selected is the one loaded 
	optionChanged();
}

/**
 * Function called by DOM changes, updates all the charts 
 */
function optionChanged() {
	// select the body where the changed value is stored
	var value = d3.select("#selDataset").property("value");
	// if the samples array is not null, try to find the matching sample value
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

	// if the metadata array is not null, try to find the matching metadata value
	if (metadata != null) {
		var length = metadata.length;
		var i;
		for (i = 0; i < length; i++)
			if (value == metadata[i].id) {
				updateGauge(metadata[i]);
				updateSelectionTable(metadata[i]);
				break;
			}
	}
}

/**
 * update the selection table 
 * @param {the metadata selected by the optionChanged function} metadata 
 */
function updateSelectionTable(metadata) {
	// grab the body
	var body = d3.select("#sample-metadata");
	// clear the prev data from view
	body.text("");
	// if metadata object is null, exit
	if (metadata == null) return;

	var text = [
		`id: ${metadata.id}`,
		`ethnicity: ${metadata.ethnicity}`,
		`gender: ${metadata.gender}`,
		`age: ${metadata.age}`,
		`location: ${metadata.location}`,
		`bbtype: ${metadata.bbtype}`,
		`wfreq: ${metadata.wfreq}`
	];
	body.append("body").html(text.join("<br>"));
}

/**
 * update the bar chart
 * @param {the sample selected by the optionChanged function} sample 
 */
function updateBarChart(sample) {
	// if the sample is null, clear and exit
	if (sample == null) {
		d3.select("bar").text("");
		return;
	}
	// filter out the top 10 otu's from the sample
	var top10OTUsFound = sortTop10OTUsFound(sample);

	// map the filtered data
	var data = [{
		x: top10OTUsFound.map(object => object.sample_values),
		y: top10OTUsFound.map(object => `OTU ${object.otu_ids} `),
		text: top10OTUsFound.map(object => object.otu_labels.split(";").join("<br>")),
		marker: {
			color: top10OTUsFound.map(object => otuIdToRgb(object.otu_ids))
		},
		type: "bar",
		orientation: "h"
	}];
	// set the layout
	var layout = {
		title: "Top 10 OTUs Found",
	};
	// plot the data
	Plotly.newPlot("bar", data, layout);
}

/**
 * sorts and returns the top 10 otu sample values
 * @param {otu_ids:{number},otu_labels:{string}, sample_values:{number}} sample 
 * @returns {otu_ids:{number},otu_labels:{string}, sample_values:{number}}
 */
function sortTop10OTUsFound(sample) {
	// create the data 'bucket'
	var sorted = [];
	// create the data for each otu sample
	var length = sample.sample_values.length;
	var i;
	for (i = 0; i < length; i++)
		sorted.push({
			otu_ids: sample.otu_ids[i],
			otu_labels: sample.otu_labels[i],
			sample_values: sample.sample_values[i]
		});
	// sort the data from the sample_values
	sorted = sorted.sort((a, b) => b.sample_values - a.sample_values);
	// if there are more than 10 data points, remove the rest
	if (length > 10)
		sorted = sorted.slice(0, 10);
	// reverse the data for large to small
	sorted = sorted.reverse();
	// send off data
	return sorted;
}

/**
 * update the bubble chart
 * @param {the sample selected by the optionChanged function} sample 
 */
function updateBubbleChart(sample) {
	// if the sample is null, clear and exit
	if (sample == null) {
		d3.select("bubble").text("");
		return;
	}
	// map the sample data
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
	// set the layout
	var layout = {
		title: `All Samples for Test Subject ID No. ${sample.id}`
	};
	// plot the data
	Plotly.newPlot("bubble", data, layout);
}

/**
 * converts the otu id into an rgb string value
 * @param {number} id the indec for the otu id
 * @returns {string} rgb(0-255,0-255,0-255)
 */
 function otuIdToRgb(id) {
	// convert the color from hue, saturation, and value into red, green, and blue
	var color = HSVtoRGB(id * otuIdToDegrees, 1.0, 1.0);
	// format and send off
	return `rgb(${color.r},${color.g},${color.b})`;
}

// https://stackoverflow.com/a/17243070
/**
 * converts the hsv to rgb
 * @param {number} h color hue number from 0-1 as a decimal in place of degrees
 * @param {number} s color saturation from 0-1 as a decimal
 * @param {number} v color value (lightness to darkness) number from 0-1 as a decimal 
 * @returns 
 */
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