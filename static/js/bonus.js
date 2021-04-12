var svgWidth = 500;
var svgHeight = 500;
const startColor = {
	r: 248,
	g: 243,
	b: 236
};
const endColor = {
	r: 133,
	g: 180,
	b: 138
};

function updateGauge(sample) {
	console.log(sample);

	var data = [
		{
			type: "indicator",
			mode: "gauge",
			value: 0,
			title: {
				text: "Scrubs per Week"
			},
			gauge: {
				visible: false,
				axis: {
					visible: false,
					range: [0, 9],
					tickwidth: 0
				},
				borderwidth: 0,
				steps: getGuageSteps()
			},
			domain: {
				row: 0,
				column: 0
			}

		}
	];

	var layout = {
		title: {
			text: "<b>Belly Button Washing Frequency</b>"
		},
		width: svgWidth,
		height: svgHeight,
		margin: { t: -200, r: 0, l: 0, b: 200 },
	};

	Plotly.newPlot('gauge', data, layout);
}

function getGuageSteps() {
	var steps = [];
	for (i = 0; i < 9; i++)
		steps.push({
			range: [i, i + 1],
			color: lerpColor(startColor, endColor, i / 9)
		});
	return steps;
}

const lerp = (x, y, a) => x * (1 - a) + y * a;

function lerpColor(color1, color2, t) {
	var r = lerp(color1.r, color2.r, t);
	var g = lerp(color1.g, color2.g, t);
	var b = lerp(color1.b, color2.b, t);
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}