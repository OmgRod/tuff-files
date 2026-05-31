FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure uploads directory exists
RUN mkdir -p data/uploads

EXPOSE 5000

CMD ["node", "server.js"]
