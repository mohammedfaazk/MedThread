FROM node:20-alpine

WORKDIR /app

COPY services/ai/package*.json ./

RUN npm install

COPY services/ai/ .

RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
