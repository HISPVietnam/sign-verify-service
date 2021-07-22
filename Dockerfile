FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD [ "node", "lib/index.js", "--host", "0.0.0.0","--port", "3000" ]
