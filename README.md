# NFT Marketplace Using Hyperledger Fabric

## **Project Summary**

This project is a decentralized NFT (Non-Fungible Token) marketplace built on **Hyperledger Fabric**, utilizing **ERC20** and **ERC721** token standards. It allows users to mint, list, and trade NFTs in a secure and decentralized environment, with ERC20 tokens serving as the currency for transactions.

### **Key Features**
- **Organizations**:
  - **Organization 1**: Responsible for managing NFTs (ERC721 tokens).
  - **Organization 2**: Handles the management of ERC20 tokens used as currency.
- **User Roles**:
  - **User 1**: Mints NFTs and lists them on the marketplace.
  - **User 2**: Mints ERC20 tokens and uses them to purchase NFTs from User 1.
- **Chaincode**:
  - Written in **Go** and deployed on the Fabric test network.
  - Implements the logic for minting, listing, and purchasing NFTs, as well as handling ERC20 tokens.
- **Client Application**:
  - Acts as a bridge between the chaincode and the web application.
  - Provides APIs to interact with the blockchain for minting tokens, listing NFTs, and facilitating purchases.
- **Backend**:
  - Fully tested and validated using **Postman**.
- **Frontend**:
  - Currently under development to provide a user-friendly interface for marketplace interactions.

---

## **Technologies Used**

### **Blockchain Framework**
- **Hyperledger Fabric**: A permissioned blockchain framework for secure and scalable decentralized applications.
- **Chaincode**: Written in **Go** to define the smart contract logic for NFTs and ERC20 tokens.

### **Backend**
- **Node.js**: Server-side runtime environment for handling API requests and blockchain interactions.
- **Express.js**: Framework for building REST APIs for the client application.
- **gRPC**: Used for communication between the client and the Hyperledger Fabric network.

### **Frontend**
- **React.js**: (In development) For building a responsive and user-friendly interface for the marketplace.

### **Development Tools**
- **Postman**: Used to test backend APIs and validate blockchain interactions.
- **Docker & Docker Compose**: For setting up the Fabric test network and running the required services.
- **Fabric-Samples**: For creating and testing the network environment.

### **Programming Languages**
- **Go**: For writing chaincode.
- **JavaScript**: For backend (Node.js) and client application logic.
- **HTML/CSS**: For the web application frontend (in progress).

### **Version Control**
- **Git**: For managing source code and collaboration.
- **GitHub**: For project repository and version control.

---

## **Installation Steps**

### **Step 1: Download Hyperledger Fabric**
Run the following command to download Fabric binaries and samples:
```bash
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
./install-fabric.sh -f '2.5.4' -c '1.5.7'
```
Step 2: Clone the Repository
Clone the project repository to your local machine using the command below:
```
git clone https://github.com/yourusername/NFT-MarketPlace-Hyperledger-Fabric.git
```
Step 3: Start the Test Network
Navigate to the test network directory:
```
cd fabric-samples/test-network
```
Start the test network with the following command:
```
./network.sh up createChannel -ca
```
Step 4: Deploy the Smart Contract
Deploy the chaincode to the channel by running the following command:
```
./network.sh deployCC -ccn token -ccp ../token-erc-20/chaincode-go/ -ccl go
```

Note: Replace ../token-erc-20/chaincode-go/ with your actual chaincode path.

Step 5: Update Configuration
Verify and adjust the directory paths in the profile.js file to match your local setup. Ensure paths for:
```
TLS certificates: tlsCertPath
User credentials: certPath, keyDirectoryPath
Peer and network configuration: peerEndpoint, peerHostAlias
```
Step 6: Start the Backend Server
Navigate to the backend folder:
```
cd Token/server/
```
Run the backend server:
```
node app.js
```
Step 7: Test the Backend API
Use Postman or any API testing tool to test the backend functionalities. Test the following endpoints:

Minting NFTs
Transferring ERC20 tokens
Purchasing NFTs


## Functions

### 1. **Initialize NFT Marketplace**
   - Initializes the NFT marketplace on the blockchain. It sets up the marketplace's basic information, such as its name and symbol.

### 2. **Create Seller Account**
   - Creates a new seller account, allowing the seller to participate in the marketplace. This includes storing the seller’s details like their name, phone number, and balance.

### 3. **Get Seller Account Details**
   - Retrieves the details of an existing seller account based on the seller’s ID. This includes information such as the seller’s name, phone number, and balance.

### 4. **Mint NFT**
   - Mints a new NFT (Non-Fungible Token) and associates it with a seller. This process involves setting the token’s URI, price, and its listing status (whether it is for sale or not).

### 5. **Query NFT**
   - Queries the blockchain for a specific NFT using its NFT ID. It returns the details of that particular NFT, including its token URI, price, and listing status.

### 6. **Get All Minted NFTs**
   - Retrieves a list of all NFTs that have been minted within the marketplace, showing each NFT’s details like token URI, price, and seller account.

### 7. **List NFTs for Sale**
   - Fetches all NFTs that are currently listed for sale in the marketplace. It returns a list of NFTs that are available for potential buyers.

### 8. **Get Client Account Balance**
   - Retrieves the current balance of a client (either a seller or a buyer). This function checks how much funds are available in the client’s account.

### 9. **Generate Buyer Account**
   - Creates a new buyer account, allowing a buyer to participate in the marketplace. This includes storing the buyer’s details such as name and phone number.

### 10. **Get Buyer Account Details**
   - Retrieves the details of an existing buyer account based on the buyer’s ID. This includes the buyer’s name and phone number.
