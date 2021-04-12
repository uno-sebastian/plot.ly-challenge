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

function updateGauge(metadata) {
	console.log(metadata);

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
				steps: getGuageSteps(),
				threshold: {
					line: {
						color: "rgb(131,3,8)",
						width: 10
					},
					thickness: 1,
					value: 9
				}
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
	modifyArcArrow(d3.select(".threshold-arc"), +metadata.wfreq);
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

function modifyArcArrow(arrow, wfreq) {
	var M = `M${160 * Math.sin(countToRadians(wfreq))},${160 * Math.cos(countToRadians(wfreq))}`;
	var A = `A${150},${0} ${0} ${0},${0} ${0},${0}`;
	var L = `L${0},${0}`;
	arrow.select("path").attr("d", `${M}${A}${L}${A}Z`);

	d3.select(".angular").selectAll(".bg-arc")
		.append("text")
		.attr("x", (d,i) => 175 * Math.sin(countToRadians(i)))
		.attr("y", (d,i) => 175 * Math.cos(countToRadians(i)))
		.attr("text-anchor", "middle")
		.text((d,i) =>`${i-1}-${i}`);
}

function countToRadians(index) {
	var angle = index * (180 / 9);
	if (index > 0)
		angle -= 0.5 * (180 / 9)
	angle = -angle - 90;
	return Math.PI * (angle / 180);
}