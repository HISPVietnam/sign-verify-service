FROM node:14
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY svs.yml .
COPY certs .
COPY schemas .
COPY packages/svs-core ./packages/svs-core
COPY packages/svs-http ./packages/svs-http
RUN yarn install --pure-lockfile --non-interactive
COPY . .
EXPOSE 3000
CMD [ "node", "packages/svs-http/lib/index.js" ]
