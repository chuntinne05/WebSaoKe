import http from "k6/http";
import { check, sleep } from "k6";

// Cấu hình stress test
export let options = {
	stages: [
		{ duration: "1m", target: 100 }, // 1 phút với 100 VUs
		{ duration: "1m", target: 200 }, // 2 phút với 200 VUs
		{ duration: "1m", target: 400 }, // 2 phút với 400 VUs
		{ duration: "1m", target: 500 }, // 2 phút với 500 VUs
		{ duration: "1m", target: 600 }, // 2 phút với 600 VUs
		{ duration: "1m", target: 700 }, // 2 phút với 700 VUs
		{ duration: "1m", target: 800 }, // 2 phút với 800 VUs
		{ duration: "1m", target: 1000 }, // 2 phút với 1000 VUs
		{ duration: "1m", target: 1500 }, // Giảm xuống 0 users
	],
	// duration: '10m',
	// vus: 200,
};

export default function () {
	const url = "http://localhost:1908/search";
	const params = {
		headers: { "Content-Type": "application/json" },
	};

	// Gửi yêu cầu GET với các tham số tìm kiếm
	const res = http.get(`${url}?date=10/09/2024&content=MTTQ`, params);

	// Kiểm tra kết quả phản hồi
	check(res, {
		"status was 200": (r) => r.status === 200,
		"response time < 200ms": (r) => r.timings.duration < 200,
	});

	// Nghỉ 1 giây trước khi gửi yêu cầu tiếp theo
	sleep(1);
}
