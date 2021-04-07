const encodeHex = (str) => new Buffer(str).toString('hex');

const decodeHex = hex => new Buffer(hex, 'hex').toString()

const pad = (num, size) => {
	var s = "000000" + num;
	return s.substr(s.length-size);
}

module.exports = {
	encodeHex,
	decodeHex,
	pad,
}
