Cách chạy test

k6

Bước 1 : Cài đặt k6 :

- brew install k6 (macOS)
- Trên Ubuntu :
  sudo apt update
  sudo apt install -y gnupg software-properties-common
  curl -s https://dl.k6.io/key.gpg | sudo apt-key add -
  echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt update
  sudo apt install k6

Bước 2 : điều chỉnh file script.js . có thể thay đổi stages và các trường tìm kiếm

Bước 3 : chạy k6
k6 run script.js

Bước 4 : đọc kết quả benchmark bao gồm
• Response times (min/avg/max).
• Requests per second.
• Success rate.

Vegeta

Bước 1 : cài đặt vegeta

- brew install vegeta (macOS)
  Các nền tảng khác tải từ link https://github.com/tsenart/vegeta/releases

Bước 2 : điều chỉnh file targets.txt có thể thay đổi stages và các trường tìm kiếm

Bước 3 : lệnh benchmark
echo "GET http://localhost:1908/search?date=10/09/2024&amount=1000&content=test" | vegeta attack -duration=30s -rate=50 | tee results.bin | vegeta report

Bước 4 : xem kết quả = đồ thị
vegeta plot results.bin > plot.html
open plot.html

LƯU Ý : Trước khi chạy các công cụ benchmark thì phải chạy server trước. Note là chạy server = lệnh nodemon app.js hoặc node app.js
sau đó bật terminal khác và chạy các lệnh trên
