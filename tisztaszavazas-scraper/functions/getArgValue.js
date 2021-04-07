export default arg => {
	try {
		return process.argv.find(a => a.startsWith(`--${arg}`)).split('=')[1]
	} catch(error){
		return undefined
	}
}