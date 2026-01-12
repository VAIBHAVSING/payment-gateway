#!/bin/bash

# Update package list
sudo apt-get update

# Install curl if not present
sudo apt-get install -y curl

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Print versions
echo "Node.js version:"
node -v
echo "NPM version:"
npm -v
echo "PM2 version:"
pm2 -v
