FROM node:12-alpine
RUN npm install pm2 -g
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]