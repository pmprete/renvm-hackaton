import React from 'react';
import GatewayJS from "@renproject/gateway";
import Web3 from "web3";
import './App.css';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InputAdornment from '@material-ui/core/InputAdornment';
import LoopIcon from '@material-ui/icons/Loop';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import { ThemeProvider } from '@material-ui/core/styles';

import BtcLogo from './img/btc.png'
import WBtcLogo from './img/wbtc.png'
import AaveLogo from './img/aave.png'

import aTokenAbi from "./abi/AToken.json";
import uniswapRouterAbi from "./abi/UniswapV2Router01.json";

// Replace with your contract's address.
const BtcToAaveCotractAddress = "0x853fd00e802c2186bd2a1ba5dc94c07ef74b16c3";
const aWbtcContractAddress = "0xCD5C52C7B30468D16771193C47eAFF43EFc47f5C";

const uniswapRouterContractAddress = "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a";
const wbtcContractAddress = "0x3b92f58feD223E2cB1bCe4c286BD97e42f2A12EA";
const renBtcContractAddress = "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab:1,
      balanceAwbtc: 0,
      amountAwbtc: 0,
      exchangeFeeAwbtc:0,
      exchangeFeeBtc:0,
      renVmFee: 0,
      amountBtc: 0,
      btcAddress: "",
      btcAddressValid: false,
      errorBtcAddressMessage: "",
      ethAddress: "",
      message: "",
      error: "",
      validAwbtcExchange: false,
      errorAwbtcMessage: "",
      validBtcExchange: false,
      errorBtcMessage: "",
      validApproveAwbtc: false,
      gatewayJS: new GatewayJS("testnet"),
    }
  }

  componentDidMount = async () => {
    let web3Provider;

    // Initialize web3 (https://medium.com/coinmonks/web3-js-ethereum-javascript-api-72f7b22e2f0a)
    // Modern dApp browsers...
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        this.logError("Please allow access to your Web3 wallet.");
        return;
      }
    }
    // Legacy dApp browsers...
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      this.logError("Please install MetaMask!");
      return;
    }

    const web3 = new Web3(web3Provider);

    const networkID = await web3.eth.net.getId();
    if (networkID !== 42) {
      this.logError("Please set your network to Kovan.");
      return;
    }

    this.setState({ web3 }, () => {

      // Update balanceAwbtcs immediately and every 10 seconds
      this.updatebalanceAwbtc();
      setInterval(() => {
        this.updatebalanceAwbtc();
      }, 10 * 1000);
    });

    this.recoverTransfers().catch(this.logError);
  }

  render = () => {
    const { balanceAwbtc, message, error, errorAwbtcMessage, validAwbtcExchange, selectedTab, exchangeFeeAwbtc, amountAwbtc,
      renVmFee, errorBtcAddressMessage, btcAddressValid, web3, errorBtcMessage,  validBtcExchange, exchangeFeeBtc, amountBtc,
      //validApproveAwbtc
    } = this.state;

    return <ThemeProvider>
      <Container maxWidth="sm">
            <div style={{textAlign:"center", border: "1px solid #eee", boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.05)",
                          marginTop: "48px", borderRadius: "4px"}}>
                <Grid item xs={12} container direction="row" justify="center"alignItems="center">
                    <img src={BtcLogo} height="70px" alt="btc logo" style={{marginRight:"10px"}}/>
                    <LoopIcon />
                    <img src={AaveLogo} height="90px" alt="aave logo"/>
                </Grid>
                <Grid item xs={12} container direction="row" justify="center"alignItems="center" style={{marginTop:"10px"}}>
                    <div>Aave balance {balanceAwbtc}</div>
                    <img src={WBtcLogo} height="25px" alt="wbtc logo" style={{marginLeft:"5px", marginRight:"5px"}}/>
                    <div>WBTC</div>
                </Grid>
                <Grid item xs={12} >
                    <Tabs
                      orientation="horizontal"
                      variant="fullWidth"
                      textColor="secondary"
                      value={selectedTab}
                      onChange={(event, newValue) => {
                          this.setState({selectedTab: newValue})
                      }}>
                      <Tab label="Withdraw" icon={<UndoIcon />} />
                      <Tab label="Deposit" icon={<RedoIcon />} />
                    </Tabs>
                </Grid>
                
                {selectedTab === 0 && <Grid  container style={{marginTop:"15px"}} >
                  <Grid item xs={12}>
                      <TextField
                          style={{ width: "80%", margin:"8px" }}
                          variant="outlined"
                          placeholder='AAVE WBTC Amount'
                          label="AAVE WBTC Amount"
                          onChange={(event) => {
                              const amount = parseFloat(event.target.value)||0;
                              this.setState({amountAwbtc: amount, validApproveAwbtc:false});
                              this.exchangeFeeFromAWbtcToRenBtc(amount);
                              this.renVmNetworkFee(amount);
                          }}
                          error={errorAwbtcMessage !== ""}
                          helperText={errorAwbtcMessage}
                          InputProps={{
                              endAdornment: <InputAdornment position="end">
                                 <img src={WBtcLogo} height="25px" alt="wbtc logo" style={{marginRight:"5px"}}/> WBTC
                              </InputAdornment>
                          }}
                          inputProps={{ 'aria-label': 'bare' }}/>
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          style={{ width: "80%", margin:"8px" }}
                          variant="outlined"
                          placeholder='Your BTC Address'
                          label="Your BTC Address"
                          onChange={(event) => {
                              const value = event.target.value
                              this.validateBtcAddress(value);
                          }}
                          error={errorBtcAddressMessage !== ""}
                          helperText={errorBtcAddressMessage}/>
                  </Grid>
                  <Grid item xs={12} style={{textAlign:"left"}}>
                        <Grid container justify="space-between" style={{ marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>Exchange Fee</span>
                          </Grid>
                          <Grid item xs={6}>
                            <span>{amountAwbtc === 0 ? '-': exchangeFeeAwbtc.toFixed(8) }</span>
                          </Grid>
                        </Grid>
                        <Grid container justify="space-between" style={{ marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>RenVM Network Fee</span>
                          </Grid>
                          <Grid item xs={6}>
                                <span>{amountAwbtc === 0 ? '-' : '-'+renVmFee.toFixed(8)}</span>
                          </Grid>
                        </Grid>
                        <Grid container justify="space-between" style={{marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>New Total</span>
                          </Grid>
                          <Grid item xs={6}>
                                <span>{amountAwbtc === 0 ? '-' : '~'+(amountAwbtc - renVmFee + exchangeFeeAwbtc).toFixed(8)+' BTC'}</span>
                          </Grid>
                        </Grid>
                  </Grid>
                  <Grid item xs={12} style={{ width: "80%", margin:"15px" }}>
                    <Button
                            disabled={!validAwbtcExchange}
                            size='large'
                            fullWidth variant="contained"
                            color="primary"
                            onClick={() => this.approveAwbtc().catch(this.logError)}
                            >
                          Approve
                      </Button>
                      <Button
                          style={{marginTop:"15px", marginBottom:"15px"}}
                          disabled={!validAwbtcExchange || !btcAddressValid }
                          size='large'
                          fullWidth variant="contained"
                          color="secondary"
                          onClick={() => this.withdraw().catch(this.logError)}>
                        Withdraw
                    </Button>
                    <p>{message}</p>
                    {error ? <p style={{ color: "red" }}>{error}</p> : null}
                  </Grid>
                </Grid>}
                {selectedTab === 1 && <Grid  container style={{marginTop:"15px"}}>
                  <Grid item xs={12}>
                      <TextField
                          style={{ width: "80%", margin:"8px" }}
                          variant="outlined"
                          placeholder='BTC Amount'
                          label="BTC Amount"
                          onChange={(event) => {
                              const amount = parseFloat(event.target.value)||0;
                              this.setState({amountBtc: amount});
                              this.exchangeFeeFromRenBtcToAWbtc(amount);
                              this.renVmNetworkFee(amount);
                          }}
                          error={errorBtcMessage !== ""}
                          helperText={errorBtcMessage}
                          InputProps={{
                              endAdornment: <InputAdornment position="end">
                                  <img src={BtcLogo} height="25px" alt="wbtc logo" style={{marginRight:"5px"}}/> BTC
                              </InputAdornment>
                          }}
                          inputProps={{ 'aria-label': 'bare' }}/>
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          style={{ width: "80%", margin:"8px" }}
                          variant="outlined"
                          placeholder='Your ETH Address'
                          label="Your ETH Address"
                          value={web3 ? web3.currentProvider.selectedAddress : ''}
                          InputProps={{
                            readOnly: true,
                          }}/>
                  </Grid>
                  <Grid item xs={12} style={{textAlign:"left"}}>
                        <Grid container justify="space-between" style={{ marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>Exchange Fee</span>
                          </Grid>
                          <Grid item xs={6}>
                            <span>{amountBtc === 0 ? '-': exchangeFeeBtc.toFixed(8) }</span>
                          </Grid>
                        </Grid>
                        <Grid container justify="space-between" style={{ marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>RenVM Network Fee</span>
                          </Grid>
                          <Grid item xs={6}>
                                <span>{amountBtc === 0 ? '-' : '-'+renVmFee.toFixed(8)}</span>
                          </Grid>
                        </Grid>
                        <Grid container justify="space-between" style={{marginLeft:"60px", marginTop: "10px" }}>
                          <Grid item xs={6}>
                                <span>New Total</span>
                          </Grid>
                          <Grid item xs={6}>
                                <span>{amountBtc === 0 ? '-' : '~'+(amountBtc - renVmFee + exchangeFeeBtc).toFixed(8)+' BTC'}</span>
                          </Grid>
                        </Grid>
                  </Grid>
                  <Grid item xs={12} style={{ width: "80%", margin:"15px" }}>
                      <Button
                          disabled={!validBtcExchange}
                          size='large'
                          fullWidth variant="contained"
                          color="secondary"
                          onClick={() => this.deposit().catch(this.logError)}
                          >
                        Deposit
                    </Button>
                    <Button
                          style={{marginTop:"15px", marginBottom:"15px"}}
                          size='large'
                          fullWidth variant="contained"
                          color="primary"
                          onClick={() => window.open("https://testnet.aave.com/dashboard/deposits", "_blank")}
                          >
                        Go to AAVE
                    </Button>
                    <p>{message}</p>
                    {error ? <p style={{ color: "red" }}>{error}</p> : null}
                  </Grid>
                </Grid>}
            </div>

        </Container>
      </ThemeProvider>
  }

  updatebalanceAwbtc = async () => {
    const { web3 } = this.state;
    const contract = new web3.eth.Contract(aTokenAbi, aWbtcContractAddress);
    const account = web3.currentProvider.selectedAddress
    const balanceAwbtc = await contract.methods.balanceOf(account).call({from: account});
    this.setState({ balanceAwbtc: parseInt(balanceAwbtc.toString()) / 10 ** 18 });
  }
  renVmNetworkFee = async (amountAwbtc) => {
   const renVmFee = amountAwbtc === 0 ? 0 : (this.state.amountAwbtc * 0.001) + 0.00035
   this.setState({renVmFee: renVmFee})
  }
  exchangeFeeFromAWbtcToRenBtc = async (amountAwbtc) => {
    const { web3, balanceAwbtc } = this.state;
    const amountAwbtcFormated = parseFloat(amountAwbtc);
    if(amountAwbtcFormated === 0){
      this.setState({errorAwbtcMessage: "", validAwbtcExchange: false, exchangeFeeAwbtc:0});
      return
    }
    if(amountAwbtcFormated > balanceAwbtc) {
      this.setState({errorAwbtcMessage: "Amount bigger than current WBTC balance in AAVE", validAwbtcExchange: false, exchangeFeeAwbtc:0});
      return
    }
    if(amountAwbtcFormated < 0.0004) {
      this.setState({errorAwbtcMessage: "Amount must be bigger than 0.0004", validAwbtcExchange: false, exchangeFeeAwbtc:0});
      return
    }
    const contract = new web3.eth.Contract(uniswapRouterAbi, uniswapRouterContractAddress);
    var amountRenBtc = 0
    const amountInWei = web3.utils.toWei(amountAwbtc.toString());
    const amountByPath = await contract.methods.getAmountsOut(amountInWei, [wbtcContractAddress,renBtcContractAddress]).call();
    amountRenBtc = amountByPath[1]
    const amountRenBtcFormated = parseInt(amountRenBtc.toString()) / 10 ** 8;
    if(amountRenBtcFormated <= (amountAwbtcFormated - amountAwbtcFormated/4)) {
      this.setState({errorAwbtcMessage: "Slipage too high, try a number lower than 0.001", validAwbtcExchange: false, exchangeFeeAwbtc:0});
      return
    }
    this.setState({exchangeFeeAwbtc: -(amountAwbtcFormated - amountRenBtcFormated), validAwbtcExchange: true, errorAwbtcMessage:""});
  }

  exchangeFeeFromRenBtcToAWbtc = async (amountRenBtc) => {
    const { web3 } = this.state;
    const amountRenBtcFormated = parseFloat(amountRenBtc);
    if(amountRenBtcFormated === 0){
      this.setState({errorBtcMessage: "", validBtcExchange: false, exchangeFeeBtc:0});
      return
    }
    if(amountRenBtcFormated < 0.0004) {
      this.setState({errorBtcMessage: "Amount must be bigger than 0.0004", validBtcExchange: false, exchangeFeeBtc:0});
      return
    }
    const contract = new web3.eth.Contract(uniswapRouterAbi, uniswapRouterContractAddress);
    const amountInStaoshi = Math.round(amountRenBtcFormated*10**8).toString()
    const amountByPath = await contract.methods.getAmountsOut(amountInStaoshi, [renBtcContractAddress, wbtcContractAddress]).call();
    const amountWbtc = amountByPath[1]
    const amountWbtcFormated = web3.utils.fromWei(amountWbtc.toString());
    if(amountWbtcFormated <= (amountRenBtcFormated - amountRenBtcFormated/4)) {
      this.setState({errorBtcMessage: "Slipage too high, try a number lower than 0.001", validBtcExchange: false, exchangeFeeBtc:0});
      return
    }
    this.setState({exchangeFeeBtc: -(amountRenBtcFormated - amountWbtcFormated), validBtcExchange: true, errorBtcMessage:""});
  }

  validateBtcAddress = async (address) => {
    if(!address){
      this.setState({btcAddress: "", btcAddressValid: false, errorBtcAddressMessage:""});
      return
    }
    const isValid = (address.length > 26 && address.length < 36) && (address[0] === 'n' || address[0] === 'm' || address[0] === '2')
    const errMsg = isValid ? "" : "Invalid BTC Address"
    this.setState({btcAddress: address, btcAddressValid: isValid, errorBtcAddressMessage: errMsg})
 
  }

  logError = (error) => {
    console.error(error);
    this.setState({ error: String((error || {}).message || error) });
  }

  log = (message) => {
    this.setState({ message });
  }

  deposit = async () => {
    const { web3, gatewayJS, amountBtc } = this.state;
    const amount = amountBtc; // BTC

    try {
      await gatewayJS.open({
        // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
        sendToken: GatewayJS.Tokens.BTC.Btc2Eth,

        // Amount of BTC we are sending (in Satoshis)
        suggestedAmount: Math.round(amount * (10 ** 8)), // Convert to Satoshis

        // The contract we want to interact with
        sendTo: BtcToAaveCotractAddress,

        // The name of the function we want to call
        contractFn: "depositBtcToAave",

        // The nonce is used to guarantee a unique deposit address
        nonce: GatewayJS.utils.randomNonce(),

        // Arguments expected for calling `deposit`
        contractParams: [
          {
            name: "_msg",
            type: "bytes",
            value: web3.utils.fromAscii(`Depositing ${amount} BTC`),
          }
        ],

        // Web3 provider for submitting mint to Ethereum
        web3Provider: web3.currentProvider,
      }).result();
      this.log(`Deposited ${amount} BTC.`);
    } catch (error) {
      // Handle error
      this.logError(error);
    }
  }
  approveAwbtc = async () => {
    const { web3, balanceAwbtc } = this.state;
    // First Approve the transfer
    const contract = new web3.eth.Contract(aTokenAbi, aWbtcContractAddress);
    const account = web3.currentProvider.selectedAddress
    const amountInWei = web3.utils.toWei(balanceAwbtc.toString())
    await contract.methods.approve(BtcToAaveCotractAddress, amountInWei).send({from:account});
  }

  withdraw = async () => {
    const { web3, gatewayJS, balanceAwbtc, btcAddress } = this.state;

    const amount = balanceAwbtc;
    const recipient = btcAddress;
    const amountInWei = web3.utils.toWei(amount.toString())

    // You can surround shiftOut with a try/catch to handle errors.

    await gatewayJS.open({
      // Send BTC from the Ethereum blockchain to the Bitcoin blockchain.
      // This is the reverse of shitIn.
      sendToken: GatewayJS.Tokens.BTC.Eth2Btc,

      // The contract we want to interact with
      sendTo: BtcToAaveCotractAddress,

      // The name of the function we want to call
      contractFn: "withrdawFromAaveToBtc",

      // Arguments expected for calling `withdraw`
      contractParams: [
        { name: "_msg", type: "bytes", value: web3.utils.fromAscii(`Withdrawing ${amount} BTC`) },
        { name: "_to", type: "bytes", value: "0x" + Buffer.from(recipient).toString("hex") },
        { name: "_amount", type: "uint256", value:  amountInWei},
      ],

      // Web3 provider for submitting burn to Ethereum
      web3Provider: web3.currentProvider,
    }).result();

    this.log(`Withdrew ${amount} BTC to ${recipient}.`);
  }

  recoverTransfers = async () => {
    const { web3, gatewayJS } = this.state;
    // Load previous transfers from local storage
    const previousGateways = await gatewayJS.getGateways();
    // Resume each transfer
    for (const transfer of Array.from(previousGateways.values())) {
      gatewayJS
        .recoverTransfer(web3.currentProvider, transfer)
        .pause()
        .result()
        .catch(this.logError);
    }
  }
}

export default App;