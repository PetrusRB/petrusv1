FROM node:22
 
WORKDIR /bot
 
COPY ./package*.json .
RUN npm install
 
COPY . .
 
RUN npm run build
 
CMD [ "npm", "start" ]
