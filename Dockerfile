FROM node:14
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY svs.yml .
COPY certs .
COPY schemas .
COPY packages/svs-core ./packages/svs-core
COPY packages/svs-http-api ./packages/svs-http-api
RUN yarn install --pure-lockfile --non-interactive
COPY . .
EXPOSE 3000
CMD [ "node", "packages/svs-http-api/lib/index.js" ]
