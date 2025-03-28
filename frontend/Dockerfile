FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure tsconfig and vite config are properly loaded
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
