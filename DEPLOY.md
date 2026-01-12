# Deployment Guide for AWS EC2

This guide outlines the steps to deploy the Payment Gateway application to an AWS EC2 instance (Ubuntu).

## Prerequisites
- An AWS EC2 instance running Ubuntu.
- SSH access to the instance.
- Git repository cloned onto the instance.

## Files
- `script/setup-ec2.sh`: Installs Node.js, NPM, and PM2.
- `script/deploy.sh`: Installs dependencies, builds the app, and starts/reloads it with PM2.
- `script/nginx.conf`: Nginx configuration template.

## Step 1: Initial Server Setup

1. **SSH into your EC2 instance**.
2. **Navigate to the project directory** (e.g., `cd payment-gateway`).
3. **Run the setup script** to install Node.js and PM2:
   ```bash
   chmod +x script/setup-ec2.sh
   ./script/setup-ec2.sh
   ```

## Step 2: Configure Environment Variables

Create a `.env.local` or `.env.production` file in the root directory with your secrets:

```bash
nano .env.local
```

Add your variables:
```
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
```

## Step 3: Nginx Reverse Proxy Setup

1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **Configure Nginx**:
   Copy the provided config to Nginx's sites-available directory. Replace `your_domain_or_ip` in the file with your actual domain or Public IP.

   ```bash
   # View the template
   cat script/nginx.conf

   # Create the config file
   sudo nano /etc/nginx/sites-available/payment-gateway
   # Paste content from script/nginx.conf here and update server_name
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/payment-gateway /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Optional: remove default site
   ```

4. **Test and Restart Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 4: Deploy Application

Run the deployment script to build and start the application:

```bash
chmod +x script/deploy.sh
./script/deploy.sh
```

## Updating the App

Whenever you pull new changes from git, simply run the deploy script again:

```bash
./script/deploy.sh
```

This will install new dependencies, rebuild the app, and reload PM2 with zero downtime.
