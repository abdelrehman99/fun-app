FROM node:20

WORKDIR /

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn run build

CMD [ "yarn", "start:dev" ]