# Use a node 16 base image
ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy package.json and install node modules
COPY package.json .
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
CMD [ "npm", "start" ]