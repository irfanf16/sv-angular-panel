# Use an official Node.js image as the base image
FROM node:18.20.4 as build-stage


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) from the src folder to the working directory
COPY package*.json ./

# Install dependencies, including Angular CLI globally
RUN npm install -g @angular/cli

# Install project dependencies with legacy peer dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

RUN ng cache clean

# Build the Angular application in production mode build
RUN ng build --configuration=production


# Use an official Nginx image as the base image for the final image
FROM nginx:latest

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Copy the built Angular application from the build-stage
COPY --from=build-stage /app/dist/staffviz_admin_portal .

# Copy nginx.conf to the Nginx configuration directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port that the Nginx server will run on
EXPOSE 9095


# The default command to start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf", "-p", "/usr/share/nginx/html"]
