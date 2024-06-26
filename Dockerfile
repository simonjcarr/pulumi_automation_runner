FROM node:18

WORKDIR /app

COPY package.json /app

RUN npm install

COPY index.js /app

CMD ["node", "index.js"]
