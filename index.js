
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');

app.all('*', (req, res) => {
	res.setHeader('access-control-allow-origin', '*');
	res.setHeader('access-control-request-method', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
	res.setHeader('access-control-allow-headers', '*');
	res.setHeader('access-control-max-age', '86400');
	res.setHeader('access-control-allow-credentials', 'true');
	//allow origin control

	if (req.method === 'OPTIONS') {
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
		res.writeHead(200);
		res.end();
		return;
	};

	let data = '';
	req.on('data', (dat) => {
		data += dat.toString();
	});
	req.on('end', () => {


		try {
			data = JSON.parse(data);
			var url = new URL(data.url);
		} catch (e) {
			res.writeHead(500);
			res.write(e.toString());
			res.end();
			return;
		};

		url.port = url.port || url.protocol === 'https:'? 443: 80;

		const request_options = {

			method: data.method,
			hostname: url.hostname,
			port: url.port,
			headers: {
				...data.headers,
				host: url.hostname + ':' + url.port
			},
			path: url.pathname
		};

		console.log(`[${new Date().toISOString()}] ${data.method} ${data.url}`);
		console.log(request_options);

		const reqClass = url.protocol === 'https:' ? https : http;
		const req_p = reqClass.request(request_options, (res_p) => {
			console.log(`[${new Date().toISOString()}] RESPONSE ${data.url}`);
			res.writeHead(res_p.statusCode, res_p.headers);
			res_p.on('data', (dat) => {
				res.write(dat);
			});
			res_p.on('end', () => {
				console.log(`[${new Date().toISOString()}] END ${data.url}`);
				res.end();
			})

		});
		req_p.end(data.data);
	});
});
app.listen(9999);