import { useState } from 'react';
import axios from 'axios';

const usePost = () => {

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const postData = async (url, payload, config = {}, throwOnError = false) => {
		setLoading(true);
		setError(null);
		try {
			const response = await axios.post(url, payload, config);
			setData(response.data);
			return response.data;
		} catch (err) {
			const msg = err.response?.data?.message || err.message || 'Something went wrong';
			setError(msg);
			if (throwOnError) throw err;
		} finally {
			setLoading(false);
		}
	};

	return { postData, loading, error, data };
};

export default usePost;