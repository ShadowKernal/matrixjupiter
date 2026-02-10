FROM node:20-alpine

WORKDIR /app

# Copy the matrixjupiter folder
COPY matrixjupiter/package*.json ./
RUN npm install

COPY matrixjupiter ./

# Build the Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
