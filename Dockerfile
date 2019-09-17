FROM node:10
RUN apt-get update
RUN apt-get install -y mpg123
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]
