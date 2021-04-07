import countryData from "../constants/countryData";

export default (megyeKod, paramToGet = 'megyeNeve')  => (
	countryData.find(country => country.megyeKod === megyeKod)[paramToGet]
)