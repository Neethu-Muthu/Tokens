package chaincode

import (
	// "encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Define objectType names for prefix
const balancePrefix = "balance"
const nftPrefix = "nft"
const approvalPrefix = "approval"
const erc20Prefix = "erc20"

// Define key names for options
const nameKey = "name"
const symbolKey = "symbol"
const totalSupplyKey = "totalSupply"
const decimalsKey = "decimals"

type Transfer struct {
	From   string `json:"from"`
	To     string `json:"to"`
	NftId  string `json:"nftId"`
	Amount int    `json:"amount"`
}
type ERC20 struct {
	TotalSupply int    `json:"totalSupply"`
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Decimals    int    `json:"decimals"`
}
type event struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Value  int    `json:"value"`
	Amount int    `json:"amount"`
}
type AccountDetails struct {
	SellerAccountId   string `json:"selleraccountId"`
	SellerName string `json:"name"`

	SellerPhoneNumber string `json:"phoneNumber"`
	SellerBalance     int    `json:"balance"`
}

type BuyerAccountDetails struct {
	BuyerId          string `json:"buyeraccountId"`
	BuyerName        string `json:"buyername"`
	BuyerPhoneNumber string `json:"buyerphoneNumber"`
	BuyerBalance     int    `json:"buyerbalance"`
}

// Define the structure for ERC-721 NFTs
type Nft struct {
	NftId    string `json:"nftId"` // Ensure correct JSON tag
	Owner    string `json:"owner"`
	TokenURI string `json:"tokenURI"`
	Listed   bool   `json:"listed"`
	Price    int    `json:"price"`
	SellerAccountId string `json:"selleraccountId"`
}

// Define the contract structure
type NFTMarketplaceContract struct {
	contractapi.Contract
}

// function to check if account exixts or not.
func (s *NFTMarketplaceContract) SellerAccountExists(ctx contractapi.TransactionContextInterface, selleraccountId string) (bool, error) {
	SellerAccountDetailsJSON, err := ctx.GetStub().GetState(selleraccountId)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return SellerAccountDetailsJSON != nil, nil
}

// Generate Account
func (s *NFTMarketplaceContract) GenerateAccountDetails(ctx contractapi.TransactionContextInterface, selleraccountId string, name string, phoneNumber string, balance int) error {
	accountDetails := AccountDetails{
		SellerAccountId:   selleraccountId,
		SellerName: name,

		SellerPhoneNumber: phoneNumber,
		SellerBalance:     balance,
	}

	SelleraccountDetailsAsBytes, _ := json.Marshal(accountDetails)

	return ctx.GetStub().PutState(selleraccountId, SelleraccountDetailsAsBytes)
}

// ReadSellerAccount reads the seller account details from the world state.
func (s *NFTMarketplaceContract) ReadSellerAccount(ctx contractapi.TransactionContextInterface, selleraccountId string) (*AccountDetails, error) {
	// Ensure the contract is initialized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is initialized: %v", err)
	}
	if !initialized {
		return nil, fmt.Errorf("contract needs to be initialized, call Initialize() first")
	}

	// Fetch the account details
	SellerAccountDetailsJSON, err := ctx.GetStub().GetState(selleraccountId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if SellerAccountDetailsJSON == nil {
		return nil, fmt.Errorf("the seller account %s does not exist", selleraccountId)
	}

	var selleraccountDetails AccountDetails
	err = json.Unmarshal(SellerAccountDetailsJSON, &selleraccountDetails)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal seller account details: %v", err)
	}

	return &selleraccountDetails, nil
}
func (c *NFTMarketplaceContract) MintWithTokenURI(ctx contractapi.TransactionContextInterface, nftId string, tokenURI string, listed bool, price int, selleraccountId string) (*Nft, error) {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return nil, errors.New("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Verify the seller account exists
	accountExists, err := c.SellerAccountExists(ctx, selleraccountId)
	if err != nil {
		return nil, fmt.Errorf("failed to check seller account existence: %v", err)
	}
	if !accountExists {
		return nil, fmt.Errorf("seller account %s does not exist", selleraccountId)
	}

	// Optionally fetch seller account details
	sellerAccount, err := c.ReadSellerAccount(ctx, selleraccountId)
	if err != nil {
		return nil, fmt.Errorf("failed to read seller account details: %v", err)
	}

	// Check if the seller account is authorized to mint based on business logic (if needed)
	if sellerAccount.SellerBalance <= 0 {
		return nil, fmt.Errorf("seller account %s does not have sufficient balance to mint NFT", selleraccountId)
	}

	// Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get clientMSPID: %v", err)
	}

	if clientMSPID != "Org1MSP" {
		return nil, errors.New("client is not authorized to mint tokens")
	}

	// Check if the token to be minted does not exist
	exists := _nftExists(ctx, nftId)
	if exists {
		return nil, fmt.Errorf("the token %s is already minted", nftId)
	}

	// Add a non-fungible token
	nft := &Nft{
		NftId:    nftId,
		Owner:    selleraccountId,
		TokenURI: tokenURI,
		Listed:   listed,
		Price:    price,
		SellerAccountId: selleraccountId,
	}

	nftKey, err := ctx.GetStub().CreateCompositeKey(nftPrefix, []string{nftId})
	if err != nil {
		return nil, fmt.Errorf("failed to CreateCompositeKey for nftKey: %v", err)
	}

	nftBytes, err := json.Marshal(nft)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal nft: %v", err)
	}

	err = ctx.GetStub().PutState(nftKey, nftBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to PutState nftBytes %s: %v", nftBytes, err)
	}

	balanceKey, err := ctx.GetStub().CreateCompositeKey(balancePrefix, []string{selleraccountId, nftId})
	if err != nil {
		return nil, fmt.Errorf("failed to CreateCompositeKey for balanceKey: %v", err)
	}

	err = ctx.GetStub().PutState(balanceKey, []byte{'\u0000'})
	if err != nil {
		return nil, fmt.Errorf("failed to PutState balanceKey %s: %v", balanceKey, err)
	}

	// Emit the Transfer event
	transferEvent := new(Transfer)
	transferEvent.From = "0x0" // Minting event
	transferEvent.To = selleraccountId
	transferEvent.NftId = nftId

	transferEventBytes, err := json.Marshal(transferEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal transferEventBytes: %v", err)
	}

	err = ctx.GetStub().SetEvent("Transfer", transferEventBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to SetEvent transferEventBytes %s: %v", transferEventBytes, err)
	}

	return nft, nil
}

// Public function to allow users to read an NFT
func (c *NFTMarketplaceContract) ReadNFT(ctx contractapi.TransactionContextInterface, nftId string) (*Nft, error) {
	return _readNFT(ctx, nftId)
}

func _readNFT(ctx contractapi.TransactionContextInterface, nftId string) (*Nft, error) {
    nftKey, err := ctx.GetStub().CreateCompositeKey(nftPrefix, []string{nftId})
    if err != nil {
        return nil, fmt.Errorf("failed to create composite key for %s: %v", nftId, err)
    }

    nftBytes, err := ctx.GetStub().GetState(nftKey)
    if err != nil {
        return nil, fmt.Errorf("failed to get state for %s: %v", nftId, err)
    }

    // Check if NFT data is empty
    if nftBytes == nil {
        return nil, fmt.Errorf("NFT %s not found in the world state", nftId)
    }

    nft := new(Nft)
    err = json.Unmarshal(nftBytes, nft)
    if err != nil {
        return nil, fmt.Errorf("failed to unmarshal nftBytes: %v", err)
    }

    return nft, nil
}


func _nftExists(ctx contractapi.TransactionContextInterface, nftId string) bool {
	nftKey, err := ctx.GetStub().CreateCompositeKey(nftPrefix, []string{nftId})
	if err != nil {
		panic("error creating CreateCompositeKey:" + err.Error())
	}

	nftBytes, err := ctx.GetStub().GetState(nftKey)
	if err != nil {
		panic("error GetState nftBytes:" + err.Error())
	}

	return len(nftBytes) > 0
}

func (c *NFTMarketplaceContract) TokenURI(ctx contractapi.TransactionContextInterface, nftId string) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", errors.New("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	nft, err := _readNFT(ctx, nftId)
	if err != nil {
		return "", fmt.Errorf("failed to get TokenURI: %v", err)
	}
	return nft.TokenURI, nil
}

// BalanceOf counts all non-fungible tokens assigned to an owner
// param owner {String} An owner for whom to query the balance
// returns {int} The number of non-fungible tokens owned by the owner, possibly zero
func (c *NFTMarketplaceContract) BalanceOf(ctx contractapi.TransactionContextInterface, selleraccountId string) int {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		panic("failed to check if contract is already initialized:" + err.Error())
	}
	if !initialized {
		panic("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// There is a key record for every non-fungible token in the format of balancePrefix.owner.nftId.
	// BalanceOf() queries for and counts all records matching balancePrefix.owner.*

	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(balancePrefix, []string{selleraccountId})
	if err != nil {
		panic("Error creating asset chaincode:" + err.Error())
	}

	// Count the number of returned composite keys
	balance := 0
	for iterator.HasNext() {
		_, err := iterator.Next()
		if err != nil {
			return 0
		}
		balance++

	}
	return balance
}
func (c *NFTMarketplaceContract) Initialize(ctx contractapi.TransactionContextInterface, name string, symbol string) (bool, error) {
	// Check minter authorization - this sample assumes Org1 is the issuer with privilege to set the name and symbol
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return false, fmt.Errorf("failed to get clientMSPID: %v", err)
	}
	if clientMSPID != "Org1MSP" {
		return false, errors.New("client is not authorized to set the name and symbol of the token")
	}

	bytes, err := ctx.GetStub().GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get Name: %v", err)
	}
	if bytes != nil {
		return false, errors.New("contract options are already set, client is not authorized to change them")
	}

	err = ctx.GetStub().PutState(nameKey, []byte(name))
	if err != nil {
		return false, fmt.Errorf("failed to PutState nameKey %s: %v", nameKey, err)
	}

	err = ctx.GetStub().PutState(symbolKey, []byte(symbol))
	if err != nil {
		return false, fmt.Errorf("failed to PutState symbolKey %s: %v", symbolKey, err)
	}

	return true, nil
}

// Checks that contract options have been already initialized
func checkInitialized(ctx contractapi.TransactionContextInterface) (bool, error) {
	tokenName, err := ctx.GetStub().GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get token name: %v", err)
	}
	if tokenName == nil {
		return false, nil
	}
	return true, nil
}
func (c *NFTMarketplaceContract) GetAllMintedNFTs(ctx contractapi.TransactionContextInterface) ([]*Nft, error) {
	// Check if contract has been initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return nil, errors.New("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Initialize a slice to store the NFTs
	var nfts []*Nft

	// Get an iterator for all NFTs by querying keys starting with nftPrefix
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(nftPrefix, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key: %v", err)
	}
	defer iterator.Close()

	// Iterate through all NFTs and fetch their details
	for iterator.HasNext() {
		// Get the next item from the iterator
		nftData, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next item from iterator: %v", err)
		}

		// Unmarshal the NFT data
		var nft Nft
		err = json.Unmarshal(nftData.Value, &nft)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal NFT data: %v", err)
		}

		// Add the NFT to the result slice
		nfts = append(nfts, &nft)
	}

	// Return all NFTs
	return nfts, nil
}
func (c *NFTMarketplaceContract) ListNFTsForSale(ctx contractapi.TransactionContextInterface) ([]*Nft, error) {
	// Check if the contract is initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return nil, errors.New("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Initialize a slice to store the listed NFTs
	var listedNFTs []*Nft

	// Get an iterator for all NFTs by querying keys starting with nftPrefix
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(nftPrefix, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key: %v", err)
	}
	defer iterator.Close()

	// Iterate through all NFTs and filter listed NFTs
	for iterator.HasNext() {
		// Get the next item from the iterator
		nftData, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next item from iterator: %v", err)
		}

		// Unmarshal the NFT data
		var nft Nft
		err = json.Unmarshal(nftData.Value, &nft)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal NFT data: %v", err)
		}

		// Add the NFT to the result slice only if it's listed
		if nft.Listed {
			listedNFTs = append(listedNFTs, &nft)
		}
	}

	// Return the list of NFTs available for sale
	return listedNFTs, nil
}

func (s *NFTMarketplaceContract) BuyerAccountExists(ctx contractapi.TransactionContextInterface, buyeraccountId string) (bool, error) {
	BuyerAccountDetailsJSON, err := ctx.GetStub().GetState(buyeraccountId)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return BuyerAccountDetailsJSON != nil, nil
}

func (s *NFTMarketplaceContract) GenerateBuyerAccount(ctx contractapi.TransactionContextInterface, buyeraccountId string, buyername string, buyerphoneNumber string) error {
    // Create buyer account details structure with initial balance as 0
    accountDetails := BuyerAccountDetails{
        BuyerId:          buyeraccountId,
        BuyerName:        buyername,
        BuyerPhoneNumber: buyerphoneNumber,
        BuyerBalance:     0, // Set initial balance as 0
    }

    // Marshal the buyer account details into JSON
    BuyeraccountDetailsAsBytes, err := json.Marshal(accountDetails)
    if err != nil {
        return fmt.Errorf("failed to marshal buyer account details: %v", err)
    }

    // Store buyer account details in world state using buyeraccountId
    err = ctx.GetStub().PutState(buyeraccountId, BuyeraccountDetailsAsBytes)
    if err != nil {
        return fmt.Errorf("failed to store buyer account details: %v", err)
    }

    // Create the composite key for the ERC-20 balance (using 'erc20Prefix' + buyeraccountId)
    erc20BalanceKey, err := ctx.GetStub().CreateCompositeKey(erc20Prefix, []string{buyeraccountId})
    if err != nil {
        return fmt.Errorf("failed to create composite key for ERC-20 balance: %v", err)
    }

    // Initialize the ERC-20 balance to 0
    erc20BalanceAsBytes := []byte("0") // Set initial ERC-20 balance to 0

    // Store ERC-20 balance in world state using the composite key
    err = ctx.GetStub().PutState(erc20BalanceKey, erc20BalanceAsBytes)
    if err != nil {
        return fmt.Errorf("failed to store ERC-20 balance for buyer: %v", err)
    }

    return nil
}

func (s *NFTMarketplaceContract) ReadBuyerAccount(ctx contractapi.TransactionContextInterface, buyeraccountId string) (*BuyerAccountDetails, error) {
    // Check if the contract has been initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is initialized: %v", err)
	}
	if !initialized {
		return nil, fmt.Errorf("contract needs to be initialized, call Initialize() first")
	}

    // Retrieve the buyer account details from world state
	buyerAccountDetailsJSON, err := ctx.GetStub().GetState(buyeraccountId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if buyerAccountDetailsJSON == nil {
		return nil, fmt.Errorf("the buyer account %s does not exist", buyeraccountId)
	}

    // Unmarshal the buyer account details into the struct
	var buyerAccountDetails BuyerAccountDetails
	err = json.Unmarshal(buyerAccountDetailsJSON, &buyerAccountDetails)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal buyer account details: %v", err)
	}

    // Return the buyer account details
	return &buyerAccountDetails, nil
}


func (s *NFTMarketplaceContract) Mint(ctx contractapi.TransactionContextInterface, amount int, buyeraccountId string, buyername string) error {
	// Check if the contract is initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract needs to be initialized, call Initialize() first")
	}

	// Verify the client's MSPID (minter authorization)
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}
	if clientMSPID != "Org2MSP" {
		return fmt.Errorf("client is not authorized to mint new tokens")
	}

	// Validate the mint amount
	if amount <= 0 {
		return fmt.Errorf("mint amount must be a positive integer")
	}

	// Retrieve buyer's current balance
	buyerDetailsJSON, err := ctx.GetStub().GetState(buyeraccountId)
	if err != nil {
		return fmt.Errorf("failed to read buyer account: %v", err)
	}
	var buyerDetails BuyerAccountDetails
	if buyerDetailsJSON == nil {
		// Initialize buyer account if not exists
		buyerDetails = BuyerAccountDetails{
			BuyerId:          buyeraccountId,
			BuyerName:        buyername,
			BuyerPhoneNumber: "", // Optionally include phone number
			BuyerBalance:     0,
		}
	} else {
		err = json.Unmarshal(buyerDetailsJSON, &buyerDetails)
		if err != nil {
			return fmt.Errorf("failed to unmarshal buyer account: %v", err)
		}
	}

	// Update buyer's balance
	newBalance, err := add(buyerDetails.BuyerBalance, amount)
	if err != nil {
		return fmt.Errorf("failed to update balance: %v", err)
	}
	buyerDetails.BuyerBalance = newBalance

	// Store updated buyer details
	buyerDetailsJSON, err = json.Marshal(buyerDetails)
	if err != nil {
		return fmt.Errorf("failed to marshal buyer details: %v", err)
	}
	err = ctx.GetStub().PutState(buyeraccountId, buyerDetailsJSON)
	if err != nil {
		return fmt.Errorf("failed to store buyer details: %v", err)
	}

	// Update total supply
	totalSupplyBytes, err := ctx.GetStub().GetState(totalSupplyKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve total token supply: %v", err)
	}
	var totalSupply int
	if totalSupplyBytes != nil {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}
	totalSupply, err = add(totalSupply, amount)
	if err != nil {
		return fmt.Errorf("failed to update total supply: %v", err)
	}
	err = ctx.GetStub().PutState(totalSupplyKey, []byte(strconv.Itoa(totalSupply)))
	if err != nil {
		return fmt.Errorf("failed to store total supply: %v", err)
	}

	// Emit an event for minting
	transferEvent := event{
		From:   "0x0", // Indicates new token creation
		To:     buyeraccountId,
		Amount: amount,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to encode event: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("Minted %d tokens for buyer %s. Updated balance: %d", amount, buyeraccountId, newBalance)
	return nil
}

// add two number checking for overflow
func add(b int, q int) (int, error) {

	// Check overflow
	var sum int
	sum = q + b

	if (sum < q || sum < b) == (b >= 0 && q >= 0) {
		return 0, fmt.Errorf("Math: addition overflow occurred %d + %d", b, q)
	}

	return sum, nil
}
func (s *NFTMarketplaceContract) BalanceOfBuyer(ctx contractapi.TransactionContextInterface, buyeraccountId string) (int, error) {
	// Check if the contract is initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("contract needs to be initialized, call Initialize() first")
	}

	// Retrieve buyer account details
	buyerDetailsJSON, err := ctx.GetStub().GetState(buyeraccountId)
	if err != nil {
		return 0, fmt.Errorf("failed to read buyer account from world state: %v", err)
	}
	if buyerDetailsJSON == nil {
		return 0, fmt.Errorf("buyer account %s does not exist", buyeraccountId)
	}

	// Unmarshal the buyer account details
	var buyerDetails BuyerAccountDetails
	err = json.Unmarshal(buyerDetailsJSON, &buyerDetails)
	if err != nil {
		return 0, fmt.Errorf("failed to unmarshal buyer account details: %v", err)
	}

	// Return the buyer's balance
	return buyerDetails.BuyerBalance, nil
}

// BuyNFTWithERC20 allows a buyer to purchase an NFT by transferring ERC-20 tokens
// 
func (c *NFTMarketplaceContract) PurchaseNFT(
    ctx contractapi.TransactionContextInterface,
    buyeraccountId string,
    nftId string,
) error {
    // 1. Check Contract Initialization
    initialized, err := checkInitialized(ctx)
    if err != nil || !initialized {
        return fmt.Errorf("contract needs to be initialized, call Initialize() first")
    }

    // 2. Validate Buyer Account
    buyerExists, err := c.BuyerAccountExists(ctx, buyeraccountId)
    if err != nil {
        return fmt.Errorf("failed to check buyer account existence: %v", err)
    }
    if !buyerExists {
        return fmt.Errorf("buyer account %s does not exist", buyeraccountId)
    }

    // 3. Fetch Buyer Details
    buyerDetails, err := c.ReadBuyerAccount(ctx, buyeraccountId)
    if err != nil {
        return fmt.Errorf("failed to fetch buyer account details: %v", err)
    }

    // 4. Fetch NFT Details
    nft, err := c.ReadNFT(ctx, nftId)
    if err != nil {
        return fmt.Errorf("NFT %s does not exist: %v", nftId, err)
    }
    if !nft.Listed {
        return fmt.Errorf("NFT %s is not listed for sale", nftId)
    }

    // 5. Validate Seller Account
    sellerExists, err := c.SellerAccountExists(ctx, nft.SellerAccountId)
    if err != nil {
        return fmt.Errorf("failed to check seller account existence: %v", err)
    }
    if !sellerExists {
        return fmt.Errorf("seller account %s does not exist", nft.SellerAccountId)
    }

    // 6. Fetch Seller Details
    sellerDetails, err := c.ReadSellerAccount(ctx, nft.SellerAccountId)
    if err != nil {
        return fmt.Errorf("failed to fetch seller account details: %v", err)
    }

    // 7. Check Buyer's Token Balance
    if buyerDetails.BuyerBalance < nft.Price {
        return fmt.Errorf("insufficient balance: buyer has %d, NFT costs %d", buyerDetails.BuyerBalance, nft.Price)
    }

    // 8. Perform Token Transactions
    buyerDetails.BuyerBalance -= nft.Price
    sellerDetails.SellerBalance += nft.Price

    // Update Buyer Details in World State
    buyerDetailsBytes, err := json.Marshal(buyerDetails)
    if err != nil {
        return fmt.Errorf("failed to marshal buyer details: %v", err)
    }
    err = ctx.GetStub().PutState(buyeraccountId, buyerDetailsBytes)
    if err != nil {
        return fmt.Errorf("failed to update buyer details in world state: %v", err)
    }

    // Update Seller Details in World State
    sellerDetailsBytes, err := json.Marshal(sellerDetails)
    if err != nil {
        return fmt.Errorf("failed to marshal seller details: %v", err)
    }
    err = ctx.GetStub().PutState(nft.SellerAccountId, sellerDetailsBytes)
    if err != nil {
        return fmt.Errorf("failed to update seller details in world state: %v", err)
    }

    // 9. Transfer NFT Ownership
    nft.Owner = buyeraccountId
    nft.Listed = false
    nftBytes, err := json.Marshal(nft)
    if err != nil {
        return fmt.Errorf("failed to marshal NFT details: %v", err)
    }
    nftKey, err := ctx.GetStub().CreateCompositeKey(nftPrefix, []string{nftId})
    if err != nil {
        return fmt.Errorf("failed to create composite key for NFT: %v", err)
    }
    err = ctx.GetStub().PutState(nftKey, nftBytes)
    if err != nil {
        return fmt.Errorf("failed to transfer NFT ownership in world state: %v", err)
    }

    // 10. Emit Transfer Event
    transferEvent := Transfer{
        From:   nft.SellerAccountId,
        To:     buyeraccountId,
        NftId:  nftId,
        Amount: nft.Price,
    }
    eventBytes, err := json.Marshal(transferEvent)
    if err != nil {
        return fmt.Errorf("failed to marshal transfer event: %v", err)
    }
    err = ctx.GetStub().SetEvent("PurchaseNFT", eventBytes)
    if err != nil {
        return fmt.Errorf("failed to emit purchase event: %v", err)
    }

    return nil
}
func (c *NFTMarketplaceContract) QueryPurchasedNFTs(
    ctx contractapi.TransactionContextInterface, 
    buyeraccountId string,
) ([]*Nft, error) {
    // Check if the buyer account exists
    buyerExists, err := c.BuyerAccountExists(ctx, buyeraccountId)
    if err != nil {
        return nil, fmt.Errorf("failed to check buyer account existence: %v", err)
    }
    if !buyerExists {
        return nil, fmt.Errorf("buyer account %s does not exist", buyeraccountId)
    }

    // Create a slice to store the NFTs owned by the buyer
    var purchasedNFTs []*Nft

    // Get all NFTs using partial composite key
    iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(nftPrefix, []string{})
    if err != nil {
        return nil, fmt.Errorf("failed to get state by partial composite key: %v", err)
    }
    defer iterator.Close()

    // Iterate through all NFTs
    for iterator.HasNext() {
        nftData, err := iterator.Next()
        if err != nil {
            return nil, fmt.Errorf("failed to iterate over NFTs: %v", err)
        }

        // Unmarshal the NFT data
        var nft Nft
        err = json.Unmarshal(nftData.Value, &nft)
        if err != nil {
            return nil, fmt.Errorf("failed to unmarshal NFT data: %v", err)
        }

        // Check if the NFT belongs to the given buyer
        if nft.Owner == buyeraccountId {
            purchasedNFTs = append(purchasedNFTs, &nft)
        }
    }

    // Return the list of purchased NFTs
    return purchasedNFTs, nil
}
