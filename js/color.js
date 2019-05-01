const letters = {'10' : 'A', '11' : 'B', '12' : 'C', '13' : 'D', '14' : 'E', '15' : 'F'};
const numbers = {'A' : '10', 'B' : '11', 'C' : '12', 'D' : '13', 'E' : '14', 'F' : '15'};

$(document).ready(function() {
	$('#hexinput').change(function() {
		var value = $(this).val();
		var rgb = convertToRGB(value);
		$('#rgb').html(rgb.join(', '));
		$('#hsl').html(convertToHSL(value).join(', '));
		$('#cmyk').html(convertToCMYK(value).join(', '));

		$('#color').css('background-image', `linear-gradient(45deg, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1), rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8))`);
	});
});

function convertToRGB(hex) {
	hex = hex.toUpperCase();
	hex = hex.substring(1, hex.length);
	hex = fillHex(hex, 6);
	var parts = [];
	for(let i = 0; i < 3; i++) {
		parts.push(hex.substring(0, 2));
		hex = hex.substring(2, hex.length);
	}

	var rgb = [];
	parts.forEach(x => {
		let result = "";
		let values = x.split('');
		values.forEach((v) => {
			if('ABCDEF'.includes(v))
				v = numbers[v];

			let temp = binary(parseInt(v));
			result += fill(temp, 4);
		});

		rgb.push(decimal(result));
	});

	return rgb;
}

function convertToCMYK(hex) {
	let rgb = convertToRGB(hex);
	let rgbPrimes = rgb.map(x => x / 255);

	let k = 1 - Math.max(...(rgbPrimes));
	let c = (1 - rgbPrimes[0] - k) / (1 - k);
	c = Number.isNaN(c) ? 0 : c;
	let m = (1 - rgbPrimes[1] - k) / (1 - k);
	m = Number.isNaN(m) ? 0 : m;
	let y = (1 - rgbPrimes[2] - k) / (1 - k);
	y = Number.isNaN(y) ? 0 : y;

	return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

function convertToHSL(hex) {
	let rgb = convertToRGB(hex).map(x => x / 255);
	let min = Math.min(...(rgb));
	let max = Math.max(...(rgb));
	let maxIndex = rgb.indexOf(max);

	let l = Math.round((min + max) / 2 * 1000) / 10;
	l = Number.isNaN(l) ? 0 : l;
	let s = l <= 50 ? (max - min) / (max + min) : (max - min) / (2.0 - max - min);
	s = Number.isNaN(s) ? 0 : s;
	s = Math.round(s * 1000) / 10;

	let h;
	switch(maxIndex) {
		case 0: h = (rgb[1] - rgb[2]) / (max - min);
		break;

		case 1: h = 2.0 + (rgb[2] - rgb[0]) / (max - min);
		break;

		default: h = 4.0 + (rgb[0] - rgb[1]) / (max - min);
	}

	h = Number.isNaN(h) ? 0 : h;
	h = Math.round(h * 10 * 60) / 10;

	return [h, `${s}%`, `${l}%`];
}

function convertToHex(red, green, blue) {
	var values = [red, green, blue];
	values = values.map(x => binary(x));
	values = values.map(x => fill(x, 8));

	var hexStream = "";
	values.forEach((x) => {
		let parts = [x.substring(0, 4), x.substring(4, x.length)];
		parts = parts.map(x => {
			x = decimal(x);
			if(x >= 10)
				return letters[x];
			return x;
		});

		hexStream += parts.join('');
	});

	return '#' + hexStream;
}

function fillHex(stream, limit) {
	while(stream.length < limit)
		stream = stream + '0';

	return stream;
}

function fill(stream, limit) {
	while(stream.length < limit)
		stream = '0' + stream;

	return stream;
}

function decimal(stream) {
	let limit = 2 ** (stream.length - 1);
	let result = 0;
	for(i of stream.split('')){
		i == '1' ? result += limit : i;
		limit /= 2;
	}

	return result;
}

function binary(value) {
	return value.toString(2);
}
