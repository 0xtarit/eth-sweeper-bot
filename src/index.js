const ethers = require("ethers");
const dotenv = require("dotenv");
let { connectToNetwork, createWallet, run, setVariables } = require("./sweeper");
let { verify } = require("./verify");

const fs = require("fs");
const pathModule = require("path");

// ===============================================

let configured = false;

let ethRpcUrl,targetWalletPrivateKey,safeWalletAddress,isFastMode;

async function config(path){

    try {

        if (path && typeof path === "object") {
            ethRpcUrl = path.ethRpcUrl?.trim();
            targetWalletPrivateKey = path.targetWalletPrivateKey?.trim();
            safeWalletAddress = path.safeWalletAddress?.trim();
            isFastMode = path.isFastMode;

            configured = true;
            return;
        }

        const fullPath = pathModule.resolve(path);

        if (!fs.existsSync(fullPath)) {
          throw new Error(`Configuration file "${path}" not found.`);
        }

        if (path) {
            console.log(`Loading configuration from ${path}`);
        } else {
            console.log("Loading default configuration from .env");
        }

        dotenv.config({ path: path });

        ethRpcUrl = process.env.ETHEREUM_RPC_URL?.trim();
        targetWalletPrivateKey = process.env.TARGET_WALLET_PRIVATE_KEY?.trim();
        safeWalletAddress = process.env.SAFE_WALLET_ADDRESS?.trim();
        isFastMode = (process.env.IS_FAST_MODE?.toLowerCase() === "true") === true;
        
        if (!safeWalletAddress || !targetWalletPrivateKey || !ethRpcUrl) {
            throw new Error("Please set SAFE_WALLET_ADDRESS, TARGET_WALLET_PRIVATE_KEY, and ETHEREUM_RPC_URL in your .env file.");
        }
        await setVariables({
          ethRpcUrl,
          targetWalletPrivateKey,
          safeWalletAddress,
          isFastMode,
        });
        configured = true;
        console.log("Configuration loaded successfully.");

    } catch (error) {
      console.log("Error loading configuration:", error.message);
      configured = false;
      process.exit(0);
    }

}

async function start(data = ".env"){

    try {

        if (!configured) {
          await config(data);
        }

        console.log("Verifying Bot Code...");
        await verify(ethRpcUrl,targetWalletPrivateKey,safeWalletAddress);

        await connectToNetwork(ethRpcUrl);
        await createWallet(targetWalletPrivateKey);

        console.log("");
        console.log("Starting sweeper bot...");
        await run();

    } catch (error) {
        console.log("Error starting the bot:", error.message);
        process.exit(0);
    }
   
}

module.exports = { config , start };