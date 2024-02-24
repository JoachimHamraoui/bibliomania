# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Android SDK
RUN apt-get update && apt-get install -y \
    android-sdk \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV ANDROID_HOME /usr/lib/android-sdk
ENV PATH $PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install -g expo-cli
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose ports required by Expo
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002


# Command to run your Expo app
CMD ["npm", "run", "web"]
