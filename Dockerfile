FROM node:14
WORKDIR /app
COPY package*.json ./
COPY .env ./
RUN npm ci
COPY . .
EXPOSE 8080
CMD [ "node", "src/index.js", "--host", "0.0.0.0","--port", "3000" ]
