# Pi Signage Pro

Welcome to the **Pi Signage Pro** setup guide! This professional-grade Digital Signage MVP is built for a Raspberry Pi and includes an Admin Dashboard and a Player (Display Screen) to show dynamic widgets.

## Requirements

1. A Raspberry Pi (Raspberry Pi 3B, 4, or 5) running the official **Raspberry Pi OS (Desktop Version)**.
2. Internet connection on your Raspberry Pi.
3. A USB Flash Drive or a way to transfer files to the Raspberry Pi.

## Zero-Knowledge Installation Instructions

If you have never used a Raspberry Pi terminal or Linux commands before, don't worry! Just follow these step-by-step instructions exactly as written.

### Step 1: Copy the Files to Your Raspberry Pi

1. **Download** this entire `pi-signage-pro` folder to your personal computer.
2. **Transfer** the `pi-signage-pro` folder onto a USB Flash Drive.
3. Plug the USB Flash Drive into your Raspberry Pi.
4. On your Raspberry Pi, open the **File Manager** (the folder icon at the top left of the screen).
5. Find your USB drive on the left side, open it, and **copy** the `pi-signage-pro` folder.
6. Click on the **home** folder (usually named `pi` or the username you chose) on the left side.
7. **Paste** the `pi-signage-pro` folder into this home directory.
   *(Important: Ensure the folder is placed directly in `/home/pi/pi-signage-pro` or your home folder, not inside Downloads or Documents).*

### Step 2: Open the Terminal

1. On your Raspberry Pi screen, look at the top-left corner.
2. Click on the **Terminal icon** (it looks like a small black box with `>_` inside). A black window will open.

### Step 3: Run the Automated Setup Script

You will need to type three simple commands into the terminal. Press the **Enter** key after typing each line.

**Command 1:** Go into the project folder.
```bash
cd pi-signage-pro/scripts
```

**Command 2:** Make the setup script executable (give it permission to run).
```bash
chmod +x setup.sh
```

**Command 3:** Run the installation script.
```bash
./setup.sh
```

### Step 4: Wait for the Installation to Finish

- The script will start downloading and installing all the necessary software (Node.js, PM2, Chromium, unclutter).
- **This process can take 10-20 minutes depending on your Raspberry Pi's speed.**
- Do not close the terminal or turn off the Raspberry Pi. You will see a lot of text scrolling by.
- Once the installation is finished, you will see a big message saying **"Installation Complete!"**.

### Step 5: Reboot Your Raspberry Pi

After the script is finished, you must restart your Raspberry Pi to apply the settings. Type this final command into the terminal and press **Enter**:

```bash
sudo reboot
```

### What Happens Next?

Once your Raspberry Pi restarts:
- It will automatically hide your mouse cursor to look professional.
- It will never go to sleep or turn off the screen.
- It will automatically launch the Chromium browser in full-screen "Kiosk" mode displaying your Digital Signage player.
- The backend server will automatically start in the background.

### Accessing the Admin Dashboard

The default login is **admin** / **admin123**.

To configure your digital signage, you will use the Admin Dashboard from another computer or phone on the **same Wi-Fi network**.

1. Find the IP Address of your Raspberry Pi. (You can usually find this in your home router's settings, or you can temporarily exit kiosk mode on the Pi and hover over the Wi-Fi icon).
2. Open a web browser on your computer or phone.
3. Type in the IP address followed by `:3000` (e.g., `http://192.168.1.50:3000`).
4. You will see the Admin login screen!

---

*Note: If you need to exit the full-screen Kiosk mode on the Raspberry Pi to do other things, you can usually press `Alt + F4` or `Ctrl + W` on a connected keyboard.*
