# `BTC to AAVE get intrest and borrow using your BTC`

Contract Created
https://kovan.etherscan.io/tx/0x46140d3e9a47be5a1fdd54020e504e892d59bb142f172e57aba894fad330db91
0xb005bb5e58878318d559561a49f0b67c616d11f0
RenVM Network Fees: 0.1% + 0.00035 BTC


testBTC tiene 8 decimales, el contrato de WBTC en testnet tiene 18 decimales.
aWBTC also has 18 decimals, and the user has to approve that first

# WBTC Cafe
https://kovan.etherscan.io/tx/0x74836c4670eeb94a2f5e9568ce660a43aa189513f778af0c7f037df4349a8d86

# Addresses in testnet needed
Testnet BTC Faucet
https://testnet-faucet.mempool.co/
https://kuttler.eu/en/bitcoin/btc/faucet/
https://coinfaucet.eu/en/btc-testnet/

RenVM 
When we cross BTC we obtain `testBTC`
https://kovan.etherscan.io/token/0x0a9add98c076448cbcfacf5e457da12ddbef4a8f
IShiftRegistry: 0x557e211ec5fc9a6737d2c6b7a1ade3e0c11a8d5d 

Kovan Faucets
https://faucet.kovan.network/
https://gitter.im/kovan-testnet/faucet


AAVE on Kovan
https://testnet.aave.com/
Redirect to allow WBTC as colateral 
https://testnet.aave.com/usage-as-collateral/WBTC-0x3b92f58fed223e2cb1bce4c286bd97e42f2a12ea0x506b0b2cf20faa8f38a4e2b524ee43e1f4458cc5/confirmation?asCollateral=true


You can use AAVE as faucet for WBTC or USDC on Kovan to keep the uniswap or curve.fi exchanges 
https://testnet.aave.com/faucet/WBTC
https://testnet.aave.com/faucet/USDC

`WBTC` contract from AAVE on Kovan (we should use the same as )
https://kovan.etherscan.io/address/0x3b92f58fed223e2cb1bce4c286bd97e42f2a12ea


`USDC` contract from AAVE on Kovan (we shoiuld use the same)
https://kovan.etherscan.io/address/0xe22da380ee6b445bb8273c81944adeb6e8450422

Coinbase API does not allow to add USDC from outside, so we are not going to be able to convert the usdc to usd
Coinbase sandbox api https://docs.pro.coinbase.com/?r=1#sandbox


#Steps that the Dapp does

Step 1:
Use Ren to get testBtc from Btc


Step2:
Use uniswap to get wbtc from testbtc

#Uniswap v2 Addresses
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

Step 3:

AAVE:
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