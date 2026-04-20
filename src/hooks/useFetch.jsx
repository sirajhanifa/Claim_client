import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url) => {

	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const res = await axios.get(url);
			setData(res.data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [url]);

	return { data, loading, error, refetch: fetchData };
};

export default useFetch;
