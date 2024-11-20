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

    sleep(1);
}