#!/bin/bash

# Setup script for Coreum development environment

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Coreum Flash Loan Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Rust is installed
echo -e "${BLUE}Checking Rust installation...${NC}"
if ! command -v rustc &> /dev/null; then
    echo -e "${YELLOW}Rust not found. Installing Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo -e "${GREEN}✓ Rust is installed${NC}"
fi

# Add wasm target
echo -e "${BLUE}Adding wasm32 target...${NC}"
rustup target add wasm32-unknown-unknown
echo -e "${GREEN}✓ wasm32 target added${NC}"

# Check if Docker is installed
echo -e "${BLUE}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Please install Docker manually:${NC}"
    echo "https://docs.docker.com/get-docker/"
    echo ""
else
    echo -e "${GREEN}✓ Docker is installed${NC}"
fi

# Check if cored is installed
echo -e "${BLUE}Checking cored installation...${NC}"
if ! command -v cored &> /dev/null; then
    echo -e "${YELLOW}cored not found.${NC}"
    echo ""
    echo "To install cored, follow the instructions at:"
    echo "https://docs.coreum.dev/tutorials/cored.html"
    echo ""
    echo "Quick install (Linux/Mac):"
    echo "  curl -LO https://github.com/CoreumFoundation/coreum/releases/download/v3.0.0/cored-linux-amd64"
    echo "  chmod +x cored-linux-amd64"
    echo "  sudo mv cored-linux-amd64 /usr/local/bin/cored"
    echo ""
else
    echo -e "${GREEN}✓ cored is installed${NC}"
    cored version
fi

# Setup Python environment for CLI
echo -e "${BLUE}Setting up Python CLI environment...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python 3 is installed${NC}"
    echo "To setup CLI, run:"
    echo "  cd cli"
    echo "  pip install -r requirements.txt"
else
    echo -e "${YELLOW}Python 3 not found. Install it to use the CLI.${NC}"
fi

# Setup Node.js environment for WebUI
echo -e "${BLUE}Checking Node.js for WebUI...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js is installed${NC}"
    node --version
    echo "To setup WebUI, run:"
    echo "  cd webui"
    echo "  npm install"
else
    echo -e "${YELLOW}Node.js not found. Install it to use the WebUI.${NC}"
    echo "Download from: https://nodejs.org/"
fi

# Create .env from example if it doesn't exist
echo ""
echo -e "${BLUE}Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}Please update .env with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env with your wallet mnemonic and configuration"
echo "2. Build contracts: ./scripts/build.sh"
echo "3. Run tests: ./scripts/test.sh"
echo "4. Deploy to Coreum: ./scripts/deploy.sh"
echo "5. Use CLI: cd cli && ./flash_loan_cli.py --help"
echo "6. Start WebUI: cd webui && npm start"
echo ""
echo "For more information, see README.md"
