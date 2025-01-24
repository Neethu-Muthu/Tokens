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
    "Initialize",
    "some name",
    "some symbol",
   
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("Chaincode Successfully Initialized");
  });
