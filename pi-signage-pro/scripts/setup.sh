#!/bin/bash

# ==============================================================================
# Pi Signage Pro - Zero-Knowledge Installation Script
# This script will automatically set up your Raspberry Pi to run the Digital Signage
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "====================================================="
echo " Starting Pi Signage Pro Installation..."
echo " This might take a while, please be patient."
echo "====================================================="

# 1. Update system and install basic utilities
echo ">>> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install required system packages
echo ">>> Installing required packages (curl, unclutter, chromium-browser, etc)..."
sudo apt-get install -y curl x11-xserver-utils unclutter chromium-browser sqlite3

# 3. Install Node.js and npm (Using Node.js 18.x as a stable version)
echo ">>> Installing Node.js..."
if ! command -v node > /dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed. Version: $(node -v)"
fi

# 4. Install PM2 globally
echo ">>> Installing PM2 for auto-start..."
sudo npm install -g pm2

# 5. Disable screen sleep/blanking
echo ">>> Disabling screen sleep and screensaver..."
# Modify autostart to disable screensaver and start chromium
AUTOSTART_DIR="/home/pi/.config/lxsession/LXDE-pi"
AUTOSTART_FILE="$AUTOSTART_DIR/autostart"

if [ ! -d "$AUTOSTART_DIR" ]; then
    mkdir -p "$AUTOSTART_DIR"
fi

cat << 'AUTOSTARTEOF' > "$AUTOSTART_FILE"
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Disable screen blanking
@xset s off
@xset -dpms
@xset s noblank

# Hide mouse cursor
@unclutter -idle 0.1 -root

# Auto-launch Chromium in Kiosk Mode
@chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:3002/
AUTOSTARTEOF

# 6. Setup Backend
echo ">>> Setting up backend..."
cd "$(dirname "$0")/../backend" || cd "$(pwd)/backend"
npm install
mkdir -p db uploads

# 7. Setup Frontend - Player
echo ">>> Setting up frontend (Player)..."
cd ../frontend-player
npm install
npm run build

# 8. Setup Frontend - Admin
echo ">>> Setting up frontend (Admin)..."
cd ../frontend-admin
npm install
npm run build

# 9. Configure PM2 to start the backend and serve the frontends
echo ">>> Configuring PM2 to auto-start services on boot..."
cd ../backend
pm2 start server.js --name pi-signage-backend

cd ../frontend-player
pm2 serve build/ 3002 --spa --name pi-signage-player

cd ../frontend-admin
pm2 serve build/ 3000 --spa --name pi-signage-admin

# Generate startup script for PM2 and save it
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
pm2 save

echo "====================================================="
echo " Installation Complete!"
echo "====================================================="
echo "Your Raspberry Pi is now configured to run Pi Signage Pro."
echo "The backend and frontends are running via PM2."
echo "Please REBOOT your Raspberry Pi now to apply all settings and start the kiosk mode."
echo "Command to reboot: sudo reboot"
echo "====================================================="
