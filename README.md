# ⚡ ETH Sweeper Bot

A utility bot that sweeps ETH from a source wallet to a safe wallet, intelligently estimating gas, retrying failed transactions, and supporting both fast and normal sweep modes.

---

## ✨ Features

- ✅ Fast mode for rapid sweeping  
- ✅ Intelligent gas estimation  
- ✅ Works with HTTPS & WebSocket RPC URLs  
- ✅ Automatic retries with delay  
- ✅ Flexible config via `.env` or direct object

---

## 📦 Installation

```bash
npm i eth-sweeper-bot
```

---

## 🚀 Usage

You can configure the bot in two different ways:

---

### 🔹 Option A – Programmatic Configuration

```js
// bot.js or index.js
const ethSweeperBot = require("eth-sweeper-bot");

ethSweeperBot.start({
  ethRpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
  targetWalletPrivateKey: "your_private_key",
  safeWalletAddress: "your_safe_address",
  isFastMode: true
});
```

---

### 🔹 Option B – .env File Configuration

1. **Create a `.env` file** in your project root:

```
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
TARGET_WALLET_PRIVATE_KEY=your_target_wallet_private_key
SAFE_WALLET_ADDRESS=your_safe_wallet_address
IS_FAST_MODE=true
```

2. **Use the following code:**

```js
// bot.js or index.js
const ethSweeperBot = require("eth-sweeper-bot");

// Use default .env
ethSweeperBot.start();

// Or specify a custom path
// ethSweeperBot.start(".env");
// ethSweeperBot.start("config/myenv.env");
```

---

## ▶️ Running the Bot

```bash
node bot.js
```

---

## 📁 Example File Structure

```
project/
├── bot.js
├── .env
└── node_modules/
```

---

## ⚠️ Important Notes

- **DO NOT** share your `.env` file or private key.  
- Use a **cold wallet** as the safe destination for best security.  
- Supports both HTTP and WebSocket RPC endpoints.

---

## 📃 License

MIT License © 2025

---

Happy sweeping! 🚀
