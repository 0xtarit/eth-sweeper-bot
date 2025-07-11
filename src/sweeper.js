  const ethers = require("ethers");

  let provider, wallet;

  let gasLimit = 21000;
  let gwei = 1000000000n; // 1 Gwei in wei

  let ethRpcUrl, targetWalletPrivateKey, safeWalletAddress, isFastMode;

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Connect to the Ethereum network
  async function connectToNetwork(_rpcUrl) {
    try {
        let envRpcUrl = _rpcUrl;

        if (!envRpcUrl) {
            console.log("Please set the ETHEREUM_RPC_URL environment variable.");
            return;
        }

        let protocol, rpcUrl;
        try {
            parseRpcLink = new URL(envRpcUrl);
            protocol = parseRpcLink.protocol.slice(0, -1);
            rpcUrl = envRpcUrl;
        } catch (e) {
            console.error("Invalid URL format:", rpcUrl);
            return;
        }

        let blockNumber;
        if (protocol === "http" || protocol === "https") {
            provider = new ethers.JsonRpcProvider(rpcUrl);
            blockNumber = await provider.getBlockNumber();
        } else {
            provider = new ethers.WebSocketProvider(rpcUrl);
            blockNumber = await provider.getBlockNumber();
        }

        console.log("Connected to Ethereum network successfully. Current block number:",blockNumber.toString(),". RPC URL:",_rpcUrl);
    } catch (error) {
        console.log("Error connecting to Ethereum network:", error);
        return;
    }
  }

  // Create a wallet instance
  async function createWallet(_targetWalletPrivateKey) {

    try {
      if (!_targetWalletPrivateKey) {
        console.log(
          "Please set the TARGET_WALLET_PRIVATE_KEY environment variable."
        );
        return;
      }
      wallet = new ethers.Wallet(_targetWalletPrivateKey, provider);
      console.log("Target Wallet address:", wallet.address);
    } catch (error) {
      console.log("Error creating wallet instance:", error);
      return;
    }

    console.log("safeWallet Address: " + safeWalletAddress);

  }

  async function getBalance(_wallet_address, mode = "eth") {
    try {
      const balance = await provider.getBalance(_wallet_address);

      switch (mode.toLowerCase()) {
        case "wei":
          return balance.toString();
      }

      return balance;
    } catch (error) {
      console.log("Error fetching wallet balance:", error);
      return null;
    }
  }

  async function getGasPrice() {
    try {
      const gasFeeData = await provider.getFeeData();
      const gasPrice = gasFeeData.gasPrice;
      return gasPrice;
    } catch (error) {
      console.log("Error fetching gas price:", error);
      return null;
    }
  }

  async function getNonce(_wallet_address) {
    try {
      const nonce = await provider.getTransactionCount(_wallet_address);
      return nonce;
    } catch (error) {
      console.error("Error fetching nonce:", error);
    }
  }

  async function createTx(walletDetails) {
    let txs = [];
    let currentNonce = walletDetails.nonce;
    let value = walletDetails.leftBalance;
    let gasPrice = walletDetails.gasPrice;

    if (isFastMode === 'true' || isFastMode) {
      let gweiValue = walletDetails.balance / gwei;
      gasPrice = ethers.parseUnits(
        (Math.floor((Number(gweiValue) / gasLimit) * 1000) / 1000).toString(),
        "gwei"
      );
      value = 1n;
    }

    try {
      for (let i = 0; i < 3; i++) {
        let tx = {
          to: safeWalletAddress,
          value: value,
          gasLimit: gasLimit,
          gasPrice: gasPrice,
          nonce: currentNonce++,
        };
        txs.push(tx);
      }

      return txs;
    } catch (error) {
      return null;
    }
  }

  async function sendTxs(txs) {
    try {
      const sendPromises = txs.map(async (txData, index) => {
        try {
          const tx = await wallet.sendTransaction(txData);
          console.log(`Transaction ${index + 1} sent:`, tx.hash);
          return tx.hash;
        } catch (err) {
          // console.error(`Error with transaction ${index + 1}:`, err);
          return null;
        }
      });

      const results = await Promise.all(sendPromises);
      return results;
    } catch (err) {
      // console.error('Error sending transactions:', err);
      return [];
    }
  }

  async function checkWallet() {
    let [balance, gasPrice, nonce] = await Promise.all([
      getBalance(wallet.address),
      getGasPrice(),
      getNonce(wallet.address),
    ]);

    if (balance === null || balance <= 0n) {
      // console.log("Error: Unable to make transaction due to insufficient balance");
      process.stdout.write(".");
      return null;
    }

    let minimumBalanceRequired = BigInt(Math.floor(Number(ethers.formatUnits(gasPrice, "gwei")) * (gasLimit + 1000) ) ) * gwei;
    let leftBalance = balance - minimumBalanceRequired;

    if (minimumBalanceRequired > balance) {
      // console.log("Balance is insufficient for transaction");
      process.stdout.write(".");
      return null;
    } else {
      return {
        balance: balance,
        gasPrice: gasPrice,
        nonce: nonce,
        leftBalance: leftBalance,
        minimumBalanceRequired: minimumBalanceRequired,
      };
    }
  }

  async function setVariables(_variables){
    gasLimit = 21000;
    gwei = 1000000000n; // 1 Gwei in wei

    ethRpcUrl = _variables.ethRpcUrl;
    targetWalletPrivateKey = _variables.targetWalletPrivateKey;
    safeWalletAddress = _variables.safeWalletAddress;
    isFastMode = _variables.isFastMode;
  }

  async function run() {

    let walletDetails = await checkWallet();
    if (walletDetails != null) {
      let createdTx = await createTx(walletDetails);
      if (createdTx != null) {
        await sendTxs(createdTx);

        await delay(10);
        await run();
      } else {
        await delay(10);
        await run();
      }
    } else {
      await delay(10);
      await run();
    }
  }


  module.exports = {
    connectToNetwork,
    createWallet,
    getBalance,
    getGasPrice,
    getNonce,
    createTx,
    sendTxs,
    checkWallet,
    run,
    setVariables,
    delay,
    provider,
    wallet,
    gasLimit,
    gwei,
    safeWalletAddress,
    targetWalletPrivateKey,
    ethRpcUrl,
    isFastMode,
  };