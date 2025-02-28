require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");
const cors = require("cors");

// Load environment variables from .env file
const INFURA_RPC = process.env.INFURA_RPC; // Infura or Alchemy RPC URL
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Your Wallet Private Key
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Smart Contract Address
const ABI = require("./EcoTokenABI.json"); // ABI file of EcoToken contract

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to Ethereum
const provider = new ethers.JsonRpcProvider(INFURA_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

console.log("Connected to Ethereum!");

// 🟢 GET Balance of Any Address
app.get("/balance/:address", async (req, res) => {
    try {
        const address = req.params.address;
        const balance = await contract.balanceOf(address);
        res.json({ address, balance: ethers.formatUnits(balance, 18) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔵 POST Transfer Tokens from Sender to Receiver
app.post("/transfer", async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const tx = await contract.transfer(recipient, ethers.parseUnits(amount, 18));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟠 POST Mint New Tokens (Only Owner/Admin)
app.post("/mint", async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const tx = await contract.mint(recipient, ethers.parseUnits(amount, 18));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟣 GET Total Token Supply
app.get("/totalSupply", async (req, res) => {
    try {
        const supply = await contract.totalSupply();
        res.json({ totalSupply: ethers.formatUnits(supply, 18) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server on Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`EcoToken API running on port ${PORT}`);
});
