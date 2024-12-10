FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1908

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


# cách chạy docker-compose : 
# docker compose up -d
# truy cập vào đường dẫn http://localhost:1908