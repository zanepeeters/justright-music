self.addEventListener('message', (e) => {
	const data = e.data;

	try {
		let result = 0;
		for (let i = 0; i < 1e7; i++) {
			result += i;
		}
		self.postMessage({ status: 'done', result });
	} catch (err) {
		self.postMessage({ status: 'error', message: err.message });
	}
});

