const { clientApplication } = require("./client");

let userClient = new clientApplication();
userClient
  .submitTxn(
    "org2",
    "mychannel",
    "token",
    "NFTMarketplaceContract",
    "invokeTxn",
    "",
    "PurchaseNFT",

   
    "buyer123",
    "nft123"
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("NFT purchased successfully");
  });
