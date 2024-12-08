import http from "k6/http";
import { check, sleep } from "k6";

// Cấu hình stress test
export let options = {
	stages: [
		{ duration: "1m", target: 100 }, // 1 phút với 100 VUs
		{ duration: "1m", target: 200 }, // 1 phút với 200 VUs
		{ duration: "1m", target: 400 }, // 1 phút với 400 VUs
		{ duration: "1m", target: 600 }, // 1 phút với 600 VUs
		{ duration: "1m", target: 800 }, // 1 phút với 800 VUs
		{ duration: "1m", target: 1000 }, // 1 phút với 1000 VUs
		{ duration: "1m", target: 1500 }, // 1 phút với 1500 VUs
	],
	// duration: '10m',
	// vus: 200,
};

export default function () {
	const url = "http://localhost:1908/search";
	const params = {
		headers: { "Content-Type": "application/json" },
	};

	const res = http.get(`${url}?date=10/09/2024&content=MTTQ`, params);

	check(res, {
		"status was 200": (r) => r.status === 200,
		"response time < 200ms": (r) => r.timings.duration < 200,
	});

	sleep(20);
}

// import http from 'k6/http';
// import { check, sleep } from 'k6';

// // Test configuration
// export const options = {
//     // Ramping up and down the number of virtual users
//     stages: [
//         // Warm up phase
//         { duration: '30s', target: 100 },

//         // Steady state load
//         { duration: '2m', target: 300 },

//         // Stress test phase
//         { duration: '1m', target: 400 },

//         { duration: '1m', target: 500 },

//         { duration: '1m', target: 700 },

//         // Ramp down
//         { duration: '30s', target: 0 }
//     ],

//     // Threshold for pass/fail criteria
//     thresholds: {
//         // 95% of requests must complete within 500ms
//         http_req_duration: ['p(95)<500'],

//         // Errors should be less than 1%
//         http_req_failed: ['rate<0.01']
//     }
// };

// // Test data for different search scenarios
// const searchScenarios = [
//     { date: '10/09/2024' },
//     { amount: 100000 },
//     { content: 'chuyen' },
//     { date: '10/09/2024', amount: 500000 },
//     { date: '10/09/2024', content: 'tin' },
//     { amount: 1000, content: 'trung' },
//     { date: '10/09/2024', amount: 100000, content: 'viet' }
// ];

// export default function () {
//     // Randomly select a search scenario
//     const scenario = searchScenarios[Math.floor(Math.random() * searchScenarios.length)];

//     // Construct query parameters
//     const params = new URLSearchParams(Object.entries(scenario)).toString();
//     const url = `http://localhost:1908/search?${params}`;

//     // Send GET request
//     const response = http.get(url);

//     // Perform checks on the response
//     check(response, {
//         'status is 200': (r) => r.status === 200,
//         'response body is not empty': (r) => r.body.length > 0,
//         'response time is less than 500ms': (r) => r.timings.duration < 500
//     });

//     // Think time to simulate real-world user behavior
//     sleep(1);
// }
