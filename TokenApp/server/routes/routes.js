const express = require("express");
const router = express.Router();
const { clientApplication } = require("./client");




router.post("/api/initializeNFTMarketplace", async (req, res) => {
  try {
    const { name, symbol } = req.body;

    // Validate request body
    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: "Both 'name' and 'symbol' are required fields",
      });
    }

    // Create an instance of the client application
    const userClient = new clientApplication();

    // Call the chaincode initialization function
    const result = await userClient.submitTxn(
      "org1", 
      "mychannel", 
      "token",
      "NFTMarketplaceContract", 
      "invokeTxn", 
      "", 
      "Initialize",
      name,
      symbol
    );

    // Decode and return the result
    res.status(201).json({
      success: true,
      message: "NFT Marketplace chaincode initialized successfully!",
      data: { result: new TextDecoder().decode(result) },
    });
  } catch (error) {
    console.error("Error initializing NFT marketplace:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing the NFT marketplace",
      data: { error: error.message },
    });
  }
});
router.post("/api/createSellerAccount", async (req, res) => {
  try {
    const { selleraccountId, name, phoneNumber, balance } = req.body;

    // Validate request body
    if (!selleraccountId || !name || !phoneNumber || !balance) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (selleraccountId, name, phoneNumber, balance) are required",
      });
    }

    // Create an instance of the client application
    const userClient = new clientApplication();

    // Call the GenerateAccountDetails function on the smart contract
    const result = await userClient.submitTxn(
      "org1",
      "mychannel",
      "token",
      "NFTMarketplaceContract",
      "invokeTxn",
      "",
      "GenerateAccountDetails",
      selleraccountId,
      name,
      phoneNumber,
      balance
    );

    // Decode and return the result
    res.status(201).json({
      success: true,
      message: "Seller account created successfully!",
      data: { result: new TextDecoder().decode(result) },
    });
  } catch (error) {
    console.error("Error creating seller account:", error);
    res.status(500).json({
      success: false,
      message: "Error creating the seller account",
      data: { error: error.message },
    });
  }
});

router.get("/api/getSellerAccount/:selleraccountId", async (req, res) => {
  try {
    const { selleraccountId } = req.params;

    // Validate selleraccountId
    if (!selleraccountId) {
      return res.status(400).json({
        success: false,
        message: "selleraccountId is required",
      });
    }

    // Create an instance of the client application
    const userClient = new clientApplication();

    // Call the ReadSellerAccount function on the smart contract
    const result = await userClient.submitTxn(
      "org1",
      "mychannel",
      "token",
      "NFTMarketplaceContract",
      "queryTxn",
      "",
      "ReadSellerAccount",
      selleraccountId
    );

    // Decode the result
    const decodedString = new TextDecoder().decode(result);

    // Parse the string as JSON
    const jsonObject = JSON.parse(decodedString);

    res.status(200).json({
      success: true,
      message: "Seller account fetched successfully",
      data: jsonObject,
    });
  } catch (error) {
    console.error("Error fetching seller account:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching the seller account",
      data: { error: error.message },
    });
  }
});
// Mint NFT Route
router.post("/api/mint", async (req, res) => {
  try {
    // Extract input fields from the request body
    const { nftId, tokenURI, listed, price, selleraccountId } = req.body;

    // Input validation
    if (
      !nftId ||
      !tokenURI ||
      !selleraccountId ||
      typeof listed !== "boolean" ||
      !price
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or incorrect data types" });
    }

    const userClient = new clientApplication();

    // Call the Fabric contract to mint the NFT using the submitTxn method
    const result = await userClient.submitTxn(
      "org1", // Org1 is the name of the organization
      "mychannel", // Channel name
      "token", // Chaincode name (i.e., the smart contract)
      "NFTMarketplaceContract", // Contract name inside the chaincode
      "invokeTxn", // Transaction type (invokeTxn for invoking the chaincode method)
      "", // No specific arguments here
      "MintWithTokenURI", // Chaincode method name
      nftId, // nftId parameter for minting
      tokenURI, // tokenURI parameter for minting
      listed.toString(), // 'listed' needs to be a string for the transaction
      price.toString(), // 'price' needs to be a string for the transaction
      selleraccountId // sellerAccountId of the seller
    );

    // Handle the result, decode the response from Fabric, and send it as the response
    const decodedResult = new TextDecoder().decode(result);
    res.status(201).json({
      message: "NFT minted successfully",
      data: JSON.parse(decodedResult), // Parse the decoded result into JSON
    });
  } catch (error) {
    console.error("Minting error:", error);
    res
      .status(500)
      .json({ message: "Error minting NFT", error: error.message });
  }
});
// Query NFT Route
router.get('/query/:nftId', async (req, res) => {
  try {
    const { nftId } = req.params;

    if (!nftId) {
      return res.status(400).json({ message: 'NFT ID is required' });
    }

    const userClient = new clientApplication();
    
    // Call the Fabric contract to fetch the NFT details
    const result = await userClient.submitTxn(
      'org1',
      'mychannel',
      'token',
      'NFTMarketplaceContract',
      'queryTxn',
      '',
      'ReadNFT',
      nftId
    );

    // Decode and parse the result
    const decodedString = new TextDecoder().decode(result);
    const nft = JSON.parse(decodedString);

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    res.status(200).json({
      message: 'NFT found',
      data: nft,
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ message: 'Error querying NFT', error: error.message });
  }
});


router.get("/getAllMintedNFTs", async (req, res) => {
  try {
    // Create a new client application instance
    let userClient = new clientApplication();

    // Call the submitTxn method to query all minted NFTs
    const result = await userClient.submitTxn(
      "org1", // Organization
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Empty string (if not used in your chaincode)
      "GetAllMintedNFTs" // Function name
    );

    // Decode the result
    const decodedResult = new TextDecoder().decode(result);

    // Parse the decoded string into JSON
    const jsonResult = JSON.parse(decodedResult);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Fetched all minted NFTs successfully!",
      data: jsonResult,
    });
  } catch (error) {
    console.error("Error fetching minted NFTs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching minted NFTs",
      data: { error: error.message },
    });
  }
});

router.get("/listNFTsForSale", async (req, res) => {
  try {
    // Create a new client application instance
    let userClient = new clientApplication();

    // Call the submitTxn method to query all listed NFTs for sale
    const result = await userClient.submitTxn(
      "org1", // Organization
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Empty string (if not used in your chaincode)
      "ListNFTsForSale" // Function name
    );

    // Decode the result
    const decodedResult = new TextDecoder().decode(result);

    // Parse the decoded string into JSON
    const jsonResult = JSON.parse(decodedResult);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Fetched all NFTs listed for sale successfully!",
      data: jsonResult,
    });
  } catch (error) {
    console.error("Error fetching NFTs listed for sale:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching NFTs listed for sale",
      data: { error: error.message },
    });
  }
});

router.get("/clientAccountBalance/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Validate sellerId
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    // Create a new client application instance
    let userClient = new clientApplication();

    // Call the submitTxn method to query the client account balance
    const result = await userClient.submitTxn(
      "org1", // Organization
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Empty string (if not used in your chaincode)
      "BalanceOf", // Function name
      sellerId // Seller account ID
    );

    // Decode the result
    const decodedResult = new TextDecoder().decode(result);

    // Parse the decoded result as JSON (if applicable)
    const balanceData = JSON.parse(decodedResult);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Client account balance retrieved successfully!",
      data: balanceData,
    });
  } catch (error) {
    console.error("Error retrieving client account balance:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving client account balance",
      data: { error: error.message },
    });
  }
});

router.post("/generateBuyerAccount", async (req, res) => {
  try {
    const { buyerId, buyerName, buyerPhoneNumber } = req.body;

    // Input validation
    if (!buyerId || !buyerName || !buyerPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: buyerId, buyerName, buyerPhoneNumber",
      });
    }

    // Create a new client application instance
    let userClient = new clientApplication();

    // Call the chaincode function
    const result = await userClient.submitTxn(
      "org1", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "invokeTxn", // Transaction type
      "", // Empty string (if not used in your chaincode)
      "GenerateBuyerAccount", // Function name
      buyerId, // buyerId
      buyerName, // buyerName
      buyerPhoneNumber // buyerPhoneNumber
    ); // Decode the result
    const decodedResult = new TextDecoder().decode(result);
    res.status(200).json({
      success: true,
      message: "Buyer account created successfully!",
      data: decodedResult,
    });
  } catch (error) {
    console.error("Error creating buyer account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create buyer account",
      error: error.message,
    });
  }
});
router.get("/readBuyerAccount/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Validate buyerId
    if (!buyerId) {
      return res.status(400).json({
        success: false,
        message: "Buyer ID is required",
      });
    }

    // Create a new client application instance
    let userClient = new clientApplication();

    // Call the chaincode function
    const result = await userClient.submitTxn(
      "org2", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Empty string (if not used in your chaincode)
      "ReadBuyerAccount", // Function name
      buyerId // Buyer ID
    );

    // Decode the result
    const decodedString = new TextDecoder().decode(result);

    // Parse the string as JSON
    const jsonObject = JSON.parse(decodedString);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Buyer account details retrieved successfully!",
      data: jsonObject,
    });
  } catch (error) {
    console.error("Error retrieving buyer account details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve buyer account details",
      error: error.message,
    });
  }
});
router.post("/mint-tokens", async (req, res) => {
  try {
    const { amount, buyerId, buyerName } = req.body;

    // Validate input
    if (!amount || !buyerId || !buyerName) {
      return res.status(400).json({
        success: false,
        message: "Amount, buyerId, and buyerName are required",
      });
    }

    // Create client instance
    let userClient = new clientApplication();

    // Submit mint transaction
    const result = await userClient.submitTxn(
      "org2", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "invokeTxn", // Transaction type
      "", // Empty string (if unused)
      "Mint", // Function name
      amount.toString(), // Mint amount
      buyerId, // Buyer ID
      buyerName // Buyer Name
    );

    // Decode the result
    const decodedResult = new TextDecoder().decode(result);

    res.status(200).json({
      success: true,
      message: "NFT minted successfully!",
      data: decodedResult,
    });
  } catch (error) {
    console.error("Error minting tokens:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mint tokens",
      error: error.message,
    });
  }
});
// GET API: Query Buyer Balance
router.get("/balance/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Validate input
    if (!buyerId) {
      return res.status(400).json({
        success: false,
        message: "Buyer ID is required",
      });
    }

    // Create client instance
    let userClient = new clientApplication();

    // Submit query transaction
    const result = await userClient.submitTxn(
      "org2", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Empty string (if unused)
      "BalanceOfBuyer", // Function name
      buyerId // Buyer ID
    );

    // Decode the result
    const decodedString = new TextDecoder().decode(result);

    // Parse the result as JSON
    const jsonObject = JSON.parse(decodedString);

    res.status(200).json({
      success: true,
      message: "Buyer balance retrieved successfully!",
      data: jsonObject,
    });
  } catch (error) {
    console.error("Error querying buyer balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to query buyer balance",
      error: error.message,
    });
  }
});
// POST API: Purchase NFT
router.post("/purchase", async (req, res) => {
  try {
    const { buyerId, nftId } = req.body;

    // Validate input
    if (!buyerId || !nftId) {
      return res.status(400).json({
        success: false,
        message: "Both buyerId and nftId are required",
      });
    }

    // Create client instance
    let userClient = new clientApplication();

    // Submit purchase transaction
    const result = await userClient.submitTxn(
      "org2", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "invokeTxn", // Transaction type
      "", // Empty string (if unused)
      "PurchaseNFT", // Function name
      buyerId, // Buyer ID
      nftId // NFT ID
    );

    // Decode and send result
    const decodedResult = new TextDecoder().decode(result);
    res.status(200).json({
      success: true,
      message: "NFT purchased successfully!",
      data: decodedResult,
    });
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    res.status(500).json({
      success: false,
      message: "Failed to purchase NFT",
      error: error.message,
    });
  }
});
// Route to query purchased NFTs by buyer account ID
router.get("/purchasedNFTs/:buyerId", async (req, res) => {
  const { buyerId } = req.params;

  // Validate the buyerId parameter
  if (!buyerId) {
    return res.status(400).json({
      success: false,
      message: "Buyer ID is required.",
    });
  }

  try {
    // Create a new client application instance
    let userClient = new clientApplication();

    // Submit the transaction to the blockchain
    const result = await userClient.submitTxn(
      "org2", // Organization name
      "mychannel", // Channel name
      "token", // Chaincode name
      "NFTMarketplaceContract", // Contract name
      "queryTxn", // Transaction type
      "", // Additional arguments (optional)
      "QueryPurchasedNFTs", // Function name in the contract
      buyerId // Function argument (buyer ID)
    );

    // Decode and parse the result
    const decodedResult = new TextDecoder().decode(result);
    const purchasedNFTs = JSON.parse(decodedResult);

    // Respond with the purchased NFTs
    return res.status(200).json({
      success: true,
      message: "Purchased NFTs retrieved successfully.",
      data: purchasedNFTs,
    });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error("Error querying purchased NFTs:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to query purchased NFTs.",
      error: error.message,
    });
  }
});

module.exports = router;
