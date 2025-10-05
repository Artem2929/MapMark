FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001
ENV DB_URL=mongodb://admin:password@mongodb:27017/mapmark?authSource=admin

# Start the application
CMD ["npm", "run", "dev"]
