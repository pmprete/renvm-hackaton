# BTC to AAVE get intrest and borrow using your BTC
Send BTC and obtain WBTC on AAVE, now you can start getting intrest for your BTC or borrow!

# Set the enviroment
You will need testnet BTC, get it from one of this faucets
Testnet BTC Faucet
- https://testnet-faucet.mempool.co/
- https://kuttler.eu/en/bitcoin/btc/faucet/
- https://coinfaucet.eu/en/btc-testnet/

And Kovan ether
Kovan Faucets
- https://faucet.kovan.network/
- https://gitter.im/kovan-testnet/faucet

Also you are going to need to have a browser compatible wallet like metamask https://metamask.io/download.html, make sure to choose Kovan once its installed.

You'll need to have nodejs https://nodejs.org/es/download/ and install yarn https://yarnpkg.com/getting-started/install
To run the dapp you need to execute on this folder:
`yarn install`
then
`yarn start`
and that will open a browser tab with the dapp.

# How to use the Dapp
The dapp is preaty simple, it has a Deposit tab, this allows to deposit BTC on AAVE, and a withdraw tab that allows to get the WBTC from AAVE to BTC

Watch the Video https://youtu.be/AMlZTXLr6Vw

## Deposit
To deposit BTC in AAVE follow these steps:

1- Unblock your browser wallet and set the network to Kovan
2- Fill the amount of BTC you want to transfer
3- Check the ETH address is the same as your wallet
4- Click on the Deposit Button, a pop up will appear with a BTC address
5- Copy the BTC address and send the same amountof BTC you filled on the dapp
6- Wait for 2 BTC confirmations (aprox 20 minutes)
7- Submit the Ethereum transaction
8- Once its mined you can check your balance on AAVE clicking on the Go to AAVE button

## Whitdraw
To withdraw BTC in AAVE follow these steps:

1- Unblock your browser wallet and set the network to Kovan
2- Fill the amount of WBTC you want to transfer
3- Fill the BTC address you want to send them
4- Click on the Approve Button, a pop up will appear to confirm the transaction, submit it and wait until is mined
5- Click on the Withdraw Button, a pop up will appear to confirm the transaction, submit it and wait until is mined
5- Once its mined RenVm will ask us to submit another Ethereum transaction
6- Wait for 12 ETH confirmations (aprox 5 minutes)
8- Once the BTc transaction is mined you can check your balance on BTC




# Developer Information

## Contract Created
https://kovan.etherscan.io/tx/0x1c642a22465594e16b85bafb88942f6b5b800d658eacf42d46940cba7ab89356
0x853fd00e802c2186bd2a1ba5dc94c07ef74b16c3

## Steps that the Contract does

### Step 1:
Use Ren to get testBtc from Btc

### Step2:
Use uniswap to get wbtc from testbtc

### Step2:
Deposit wbtc in AAVE, obtain aWBTC transfer it to the user

# Addresses in testnet needed

## RenVM 
When we cross BTC we obtain `testBTC`
https://kovan.etherscan.io/token/0x0a9add98c076448cbcfacf5e457da12ddbef4a8f
IShiftRegistry: 0x557e211ec5fc9a6737d2c6b7a1ade3e0c11a8d5d 


## Uniswap v2 Addresses
https://uniswap.exchange/pool

Router testBTC to WBTC
https://kovan.etherscan.io/address/0xf164fc0ec4e93095b804a4795bbe1e041497b92a#code

SWAP Tx example
https://kovan.etherscan.io/tx/0xa558c70ce775c1d56403a91f3c3a0f690762dce342d946473579e995ff8024c6

Function: swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)

MethodID: 0x38ed1739
#	Name	Type	Data
0	amountIn	uint256	10000000000000
1	amountOutMin	uint256	991
2	path	address[]	3b92f58fed223e2cb1bce4c286bd97e42f2a12ea
                        0a9add98c076448cbcfacf5e457da12ddbef4a8f
3	to	address	9c95b0ef2d3e1d9ca479524ba738c87be28c1585
4	deadline	uint256	1590348517


## AAVE on Kovan
https://testnet.aave.com/

testBTC has 8 decimales, the WBTC contract in testnet has 18 decimales.

You can use AAVE as faucet for WBTC  on Kovan to keep the uniswap or curve.fi exchanges 
https://testnet.aave.com/faucet/WBTC

`WBTC` contract from AAVE on Kovan (we should use the same as )
https://kovan.etherscan.io/address/0x3b92f58fed223e2cb1bce4c286bd97e42f2a12ea

- Accept approve WBTC to transfer from 
https://kovan.etherscan.io/tx/0x06364777fbe8ed2ec1d57b794c6da8c26056fb6f68ae874ccd5d1e9675f6347b
- Then deposit WBTC in AAVE
https://kovan.etherscan.io/tx/0x1c8605eaa438abba350fa4a8d33323bc74adef407bc7889f851d7599c3b8ffc1

- BORROW USDC (we used 25% of the total amount and variable rate)
https://kovan.etherscan.io/tx/0x19842cdd6f82c93ff21a0738b431275043f9d26b12b3f83dd9da3498909e68b4

Function: borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) ***

MethodID: 0xc858f5f9
[0]:  000000000000000000000000e22da380ee6b445bb8273c81944adeb6e8450422
[1]:  00000000000000000000000000000000000000000000000000000008c614bcc0
[2]:  0000000000000000000000000000000000000000000000000000000000000002
[3]:  0000000000000000000000000000000000000000000000000000000000000000

- REPAY (100%)
https://kovan.etherscan.io/tx/0x871ae6597b793a591a7ff6bc41ee884848fe6aaf635d2deb726f8a57fc8f09f7

Function: repay(address _reserve, uint256 _amount, address _onBehalfOf) ***

MethodID: 0x5ceae9c4
[0]:  000000000000000000000000e22da380ee6b445bb8273c81944adeb6e8450422
[1]:  00000000000000000000000000000000000000000000000000000008d15407aa
[2]:  0000000000000000000000009c95b0ef2d3e1d9ca479524ba738c87be28c1585



Whithdraw
https://kovan.etherscan.io/tx/0xb94028897f7642c92c22adab971c93fc8d4c3e630630094c4c6921cf40a459bb

Function: redeem(uint256 amount) ***

MethodID: 0xdb006a75
[0]:  0000000000000000000000000000000000000000000000d8d726b7177a800000