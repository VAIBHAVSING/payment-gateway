#!/bin/bash

# Navigate to app directory (assumes script is run from project root or handles path)
# In a real deployment, you might cd into the repo directory
# cd /path/to/your/app

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Starting/Restarting application with PM2..."
# Start the app named 'payment-gateway'
# If it's already running, reload it to apply changes with zero downtime
if pm2 list | grep -q "payment-gateway"; then
    pm2 reload payment-gateway
else
    pm2 start npm --name "payment-gateway" -- start
fi

echo "Saving PM2 process list..."
pm2 save

echo "Deployment complete!"
