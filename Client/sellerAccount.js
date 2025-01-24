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
    "GenerateAccountDetails",
    "seller123",
    "John Joe",
    "34344423232",
    "1000"
  )
  .then((result) => {
    console.log(new TextDecoder().decode(result));
    console.log("seller account created successfully");
  });
