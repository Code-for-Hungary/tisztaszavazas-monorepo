export const encodeHex = (str) => new Buffer(str).toString('hex');

export const decodeHex = hex => new Buffer(hex, 'hex').toString()

export const pad = (num, size) => {
	var s = "000000" + num;
	return s.substr(s.length-size);
}
