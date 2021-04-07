module.exports = (num, size) => {
	var s = "000000" + num;
	return s.substr(s.length-size);
}