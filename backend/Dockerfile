FROM node:16

RUN apt-get install libcurl4

WORKDIR /usr/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm run start
