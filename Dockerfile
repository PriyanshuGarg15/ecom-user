FROM node:17.9.1
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 4040
CMD ["npm","run","server"]