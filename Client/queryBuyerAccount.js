const { clientApplication } = require("./client");

let userClient = new clientApplication();
userClient
  .submitTxn(
    "org2",
    "mychannel",
    "token",
    "NFTMarketplaceContract",
    "queryTxn",
    "",
    "ReadBuyerAccount",
    "buyer123"
  )
  .then((result) => {
    // Decode the Uint8Array to a string
    const decodedString = new TextDecoder().decode(result);

    // Parse the string as JSON
    const jsonObject = JSON.parse(decodedString);

    console.log("Seller account data: ");
    // Log the JSON object
    console.log(jsonObject);
  });
