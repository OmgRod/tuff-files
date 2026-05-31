FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
