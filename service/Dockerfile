FROM node:alpine

WORKDIR /app

COPY package.json /app
COPY ./src /app/src
COPY .babelrc /app
RUN npm install
RUN npm build

CMD npm start

EXPOSE 8050