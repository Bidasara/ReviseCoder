FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
# This caches your dependencies for faster builds
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your app's source code from your computer to the container
COPY . .

# Your app binds to this port, make it available
# Cloud Run will automatically use the PORT environment variable
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "index.js" ] 