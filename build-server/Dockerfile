FROM ubuntu:jammy

# Switch to the main Ubuntu archive mirror
RUN sed -i 's|http://ports.ubuntu.com/ubuntu-ports|http://archive.ubuntu.com/ubuntu|' /etc/apt/sources.list

# Clean apt cache, update, and fix missing packages
RUN rm -rf /var/lib/apt/lists/* && apt-get clean && apt-get update && apt-get dist-upgrade -y


# Install Node.js from Nodesource
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y

# Install Node.js and Git
RUN apt-get install -y nodejs git

# Set the working directory
WORKDIR /home/app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the shell script and script.js
COPY main.sh .
COPY script.js .

# Make the scripts executable
RUN chmod +x main.sh
RUN chmod +x script.js

# Set the entrypoint to the shell script
ENTRYPOINT [ "/home/app/main.sh" ]
