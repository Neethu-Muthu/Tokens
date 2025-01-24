const { clientApplication } = require("./client");

let userClient = new clientApplication();
userClient
  .submitTxn(
    "org1",
    "mychannel",
    "token",
    "NFTMarketplaceContract",
    "invokeTxn",
    "",
    "MintWithTokenURI",
    "nft123",
    "https://example.com/nft123",
    "true",
    "1000",
    "seller123"
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("NFT minted successfully");
  });
