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

