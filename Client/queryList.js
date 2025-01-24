const { clientApplication } = require("./client");

let userClient = new clientApplication();
userClient
  .submitTxn(
    "org1",
    "mychannel",
    "token",
    "NFTMarketplaceContract",
    "queryTxn",
    "",
    "ListNFTsForSale"
  )
  .then((result) => {
    // Decode the Uint8Array to a string
    const decodedString = new TextDecoder().decode(result);

    // Parse the string as JSON
    const jsonObject = JSON.parse(decodedString);

    console.log("Listed NFTs are: ");
    // Log the JSON object
    console.log(jsonObject);
  });
