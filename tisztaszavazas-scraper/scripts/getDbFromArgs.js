
export default () => {
	const valasztasAzonosito = process.argv[2];
	const version = process.argv[3];
	if (!valasztasAzonosito || !version) throw new Error('valasztasAzonosito and version are mandatory, like `crawlSzkUrl onk2019 v2`')
	
	return {
		db: `${valasztasAzonosito}_${version}`,
		valasztasAzonosito,
		version
	}
}