# Sử dụng node.js làm base image
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package files vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng chạy ứng dụng
EXPOSE 1908

# Command để chạy ứng dụng
CMD ["npm", "start"]

# docker build -t chuntinne/hcmutsaoke:latest .
# docker login
# docker push chuntinne/hcmutsaoke:latest

# cách chạy

# tải dockerhub và login 
# docker pull chuntinne/hcmutsaoke:latest
# docker run -p 1908:1908 chuntinne/hcmutsaoke:latest

# xem containter nào đang chạy cổng 1908
# lsof -i :1908
# kill -9 <PID>


# kiểm tra docker
# docker ps
# docker stop <container_id>
# docker rm <container_id> 