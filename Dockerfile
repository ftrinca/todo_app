FROM node:lts
WORKDIR /usr/src/app
COPY . . 
RUN npm install
CMD ["node", "src/index.js"]