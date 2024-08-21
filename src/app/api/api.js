export default function fetchWithAuth(subUrl, method, options) {
	const headers = {
		...options?.headers,
		Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
	};

	if (options?.body) {
		try {
			// FormData가 아닌 경우
			if (FormData.prototype.isPrototypeOf(options.body) === false) {
				options.body = JSON.stringify(options.body);
				headers["Content-Type"] = "application/json";
			}
		} catch {
			const _ = 0;
		}
	}

	return fetch(`${process.env.NEXT_PUBLIC_SITE_URL}${subUrl}`, {
		method,
		...options,
		headers,
	});
}
