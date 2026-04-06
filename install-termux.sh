#!/bin/bash

echo "========================================="
echo " Arcadegamer254 OS - Termux Installer"
echo "========================================="

# Update and upgrade packages
echo "[*] Updating package lists..."
pkg update -y && pkg upgrade -y

# Install required dependencies
echo "[*] Installing dependencies (Node.js, Git, etc.)..."
pkg install -y nodejs git python make clang

# Clone the repository (assuming it's hosted on GitHub, or copy files)
# If you already have the files, you can skip this step.
# echo "[*] Cloning repository..."
# git clone https://github.com/arcadegamer254/os.git
# cd os

# Install npm dependencies
echo "[*] Installing npm packages..."
npm install

# Build the project
echo "[*] Building the OS..."
npm run build

echo "========================================="
echo " Installation Complete!"
echo " To start the OS, run:"
echo "   npm run start"
echo "========================================="
