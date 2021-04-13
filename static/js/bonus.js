// the svg settings
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

/**
 * update the gauge with the sent in metadata
 * honestly this was a hacked together way of achieving my goal
 * @param {object} metadata 
 */
function updateGauge(metadata) {
	// create the gauge data
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
	// create the gauge layout
	var layout = {
		title: {
			text: "<b>Belly Button Washing Frequency</b>"
		},
		width: svgWidth,
		height: svgHeight,
		margin: { t: -200, r: 0, l: 0, b: 200 },
	};
	// plot the gauge
	Plotly.newPlot('gauge', data, layout);
	// add in the numbers
	addArcNumbers(d3.select(".angular"));
	// modify the gauge
	modifyArcArrow(d3.select(".threshold-arc"), +metadata.wfreq);
}

/**
 * get the steps required for the gauge steps 
 * @returns an array of gauge steps
 */
function getGuageSteps() {
	// create the empty data object
	var steps = [];
	// create 9 steps
	for (i = 0; i < 9; i++)
		steps.push({
			range: [i, i + 1],
			color: lerpColor(startColor, endColor, i / 9)
		});
	// send off the data
	return steps;
}

/**
 * linear interpolation function (aka lerp)
 * @param {number} x the starting value
 * @param {number} y the ending value
 * @param {number} t the lerp amount 
 * @returns {number} the lerped number
 */
const lerp = (x, y, t) => x * (1 - t) + y * t;

/**
 * linear interpolation function for color
 * @param {color} colorX the starting color
 * @param {color} colorY the ending color
 * @param {number} t the lerp amount 
 * @returns {string} rgb string
 */
function lerpColor(colorX, colorY, t) {
	var r = lerp(colorX.r, colorY.r, t);
	var g = lerp(colorX.g, colorY.g, t);
	var b = lerp(colorX.b, colorY.b, t);
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * modifies the arc to have numbers
 */
 function addArcNumbers(arch) {
	// add in the arch text
	arch.selectAll(".bg-arc")
		.append("text")
		.attr("x", (d, i) => 175 * Math.sin(archIndexToRadians(i)))
		.attr("y", (d, i) => 175 * Math.cos(archIndexToRadians(i)))
		.attr("text-anchor", "middle")
		.text((d, i) => `${i - 1}-${i}`);
}

/**
 * converts the arch index into radians in a 180 degree arch
 * @param {number} index the arch index
 * @returns {number} radians
 */
function archIndexToRadians(index) {
	var angle = index * (180 / 9);
	if (index > 0)
		angle -= 0.5 * (180 / 9)
	angle = -angle - 90;
	return Math.PI * (angle / 180);
}

/**
 * modifies the arc arrow to point at the correct wash frequency
 * @param {arrow} arrow the arrow html object
 * @param {number} wfreq the wash frequency
 */
function modifyArcArrow(arrow, wfreq) {
	var radians = archIndexToRadians(wfreq);
	// set the m, a, and l values to modify an arrow
	var M = `M${160 * Math.sin(radians)},${160 * Math.cos(radians)}`;
	var A = `A${150},${0} ${0} ${0},${0} ${0},${0}`;
	var L = `L${0},${0}`;
	// add in the modified arrow
	arrow.select("path").attr("d", `${M}${A}${L}${A}Z`);
}

