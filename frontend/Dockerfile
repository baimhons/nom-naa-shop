FROM node:alpine3.20

WORKDIR /app

COPY . .

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install

CMD ["npm","run","dev"]