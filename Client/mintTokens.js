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
    "Mint",
   
    "2000",
    "buyer123",
    "Baekhyun"
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("NFT minted successfully");
  });
