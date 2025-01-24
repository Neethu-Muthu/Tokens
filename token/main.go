package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-contract-api-go/metadata"
	"tokens/chaincode"
)

func main() {
	// Create an instance of your NFT contract (the one you defined in the chaincode package)
	marketplace := new(chaincode.NFTMarketplaceContract)

	// Set metadata for the contract (optional, if you want metadata for your contract)
	marketplace.Info.Version = "0.0.1"
	marketplace.Info.Description = "ERC-721 fabric port"
	marketplace.Info.License = new(metadata.LicenseMetadata)
	marketplace.Info.License.Name = "Apache-2.0"
	marketplace.Info.Contact = new(metadata.ContactMetadata)
	marketplace.Info.Contact.Name = "Matias Salimbene"

	// Create the chaincode instance from your contract
	cc, err := contractapi.NewChaincode(marketplace)
	if err != nil {
		panic("Error creating chaincode: " + err.Error())
	}

	// Set chaincode-specific metadata (optional)
	cc.Info.Title = "ERC-721 Chaincode"
	cc.Info.Version = "0.0.1"

	// Start the chaincode
	if err := cc.Start(); err != nil {
		panic("Error starting chaincode: " + err.Error())
	}
}
