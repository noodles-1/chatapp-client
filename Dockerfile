FROM node:17-alpine

WORKDIR /chatapp-client

COPY package.json .

RUN npm install

COPY . .

CMD npm run dev -- --host