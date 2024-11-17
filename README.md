Cách test sử dụng K6 và Vegeta

K6

B1 : Tải k6

- macOs : brew install k6
- ubuntu : sudo apt update
  sudo apt install -y gnupg software-properties-common
  curl -s https://dl.k6.io/key.gpg | sudo apt-key add -
  echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt update
  sudo apt install k6

B2 : điều chỉnh stages và/hoặc trường tìm kiếm để load các stress test khác nhau (trong file script.js)

B3 : chạy k6
k6 run script.js

B4 : đọc kết quả benchmark hiển thị , bao gồm :
• Response times (min/avg/max).
• Requests per second.
• Success rate.

- lặp lại và tăng dần VUs để xem mức độ chịu tải của code

Vegeta

B1 : Tải vegeta

- macOs : brew install vegeta
- ubuntu : tải từ link https://github.com/tsenart/vegeta/releases

B2 : điều chỉnh trường tìm kiếm để load các stress test khác nhau (trong targets.txt)

B3 : chạy vegeta
echo "GET http://localhost:1908/search?date=10/09/2024&amount=1000&content=test" | vegeta attack -duration=30s -rate=50 | tee results.bin | vegeta report
có thể điều chỉnh các thông số :
• -duration=30s: Thời gian test là 30 giây.
• -rate=50: Gửi 50 requests/giây.

B4 : đọc kết quả benchmark hiển thị bằng đồ thị :
vegeta plot results.bin > plot.html
open plot.html

- Vegeta cung cấp các chỉ số:
  • Latency: Độ trễ phản hồi.
  • Throughput: Số requests xử lý được mỗi giây.
  • Error rate: Tỷ lệ lỗi.

- lặp lại và tăng dần VUs để xem mức độ chịu tải của code

LƯU Ý : trước khi thực hiện các bước trên thì hãy khởi động server trước : (nodemon app.js) sau nó bật terminal khác, điều hướng về thư mục WebSaoKe( cd WebSaoKe)
và chạy các bước trên

thắc mắc thì tự hỏi chatgpt <3
