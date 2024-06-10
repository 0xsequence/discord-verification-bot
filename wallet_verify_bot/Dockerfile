FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY wallet_verify_bot ./

RUN npm install

CMD [ "node", "src/index.ts" ]