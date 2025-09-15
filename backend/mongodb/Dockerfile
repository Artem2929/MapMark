FROM mongo:7.0

# Create a directory for MongoDB data
RUN mkdir -p /data/db

# Expose MongoDB default port
EXPOSE 27017

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=password
ENV MONGO_INITDB_DATABASE=mapmark

# Create initialization script for geo collections
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Start MongoDB
CMD ["mongod", "--bind_ip_all"]
