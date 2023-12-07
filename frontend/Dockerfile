FROM node:20

WORKDIR /usr/frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4200

CMD npm run start -- --host 0.0.0.0 --disable-host-check
