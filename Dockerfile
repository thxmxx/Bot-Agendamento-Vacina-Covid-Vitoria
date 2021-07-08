FROM buildkite/puppeteer:10.0.0

WORKDIR /usr/app
COPY package*.json ./
RUN npm i --only=prod
COPY . .

CMD [ "index.js" ]
ENTRYPOINT [ "node" ]