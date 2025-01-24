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
    "GenerateBuyerAccount",
    "buyer123",
    "Baekhyun",
    "34344423232",
   
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("buyer account created successfully");
  });
