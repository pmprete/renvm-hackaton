pragma solidity >=0.5.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IAToken {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function redeem(uint256 _amount) external;
}

interface IGatewayRegistry {
    function getGatewayBySymbol(string calldata _tokenSymbol) external view returns (IGateway);
    function getTokenBySymbol(string calldata _tokenSymbol) external view returns (IERC20);
}

interface IGateway {
    function mint(bytes32 _pHash, uint256 _amount, bytes32 _nHash, bytes calldata _sig) external returns (uint256);
    function burn(bytes calldata _to, uint256 _amount) external returns (uint256);
}

interface IUniswapRouterV2 {
    function factory() external pure returns (address);
    function swapExactTokensForTokens(
        uint _amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function getAmountsOut(uint _amountIn, address[] calldata patht) external pure returns (uint[] memory amounts);
}

interface IAaveLendingPool {
    function deposit(address _reserve, uint256 _amount, uint16 _referralCode) external;
    function borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) external;
    function repay( address _reserve, uint256 _amount, address payable _onBehalfOf) external;
}

contract BtcToAave {
    IGatewayRegistry public registry = IGatewayRegistry(0x557e211EC5fc9a6737d2C6b7a1aDe3e0C11A8D5D);
    IERC20 public wBTC = IERC20(0x3b92f58feD223E2cB1bCe4c286BD97e42f2A12EA);
    IAToken public aWbtc = IAToken(0xCD5C52C7B30468D16771193C47eAFF43EFc47f5C);
    //Uniswap Router between ren btc (testBtc) and WBTC
    IUniswapRouterV2 public uniswapRouter = IUniswapRouterV2(0xf164fC0Ec4E93095b804a4795bBe1e041497b92a);
    //https://docs.aave.com/developers/deployed-contracts/deployed-contract-instances
    address public aAveLendingPoolCore = 0x95D1189Ed88B380E319dF73fF00E479fcc4CFa45;
    IAaveLendingPool public aAveLendingPool = IAaveLendingPool(0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c);

    event Deposit(uint256 _amount, bytes _msg);
    event Withdrawal(bytes _to, uint256 _amount, bytes _msg);

    function depositBtcToAave(
        // Parameters from users
        bytes calldata _msg,
        // Parameters from Darknodes
        uint256        _amount,
        bytes32        _nHash,
        bytes calldata _sig) external returns(uint256){
        uint256 amount = depositBtc(_msg, _amount, _nHash, _sig);
        amount = swapRenBtcToWbtc(amount);
        amount = wBtcToAave(amount);
        return amount;
    }

    function withrdawFromAaveToBtc(bytes calldata _msg, bytes calldata _to, uint256 _amount) external returns(uint256){
        uint256 amount = aAaveToWbtc(_amount);
        amount = swapWbtcToRenBtc(amount);
        amount = withdrawBtc(_msg, _to, amount);
        return amount;
    }

    function depositBtc(
        // Parameters from users
        bytes memory _msg,
        // Parameters from Darknodes
        uint256        _amount,
        bytes32        _nHash,
        bytes memory _sig
    ) private returns(uint256){
        bytes32 pHash = keccak256(abi.encode(_msg));
        uint256 mintedAmount = registry.getGatewayBySymbol("BTC").mint(pHash, _amount, _nHash, _sig);
        emit Deposit(mintedAmount, _msg);
        return mintedAmount;
    }

    function withdrawBtc(bytes memory _msg, bytes memory _to, uint256 _amount) private returns(uint256){
        uint256 burnedAmount = registry.getGatewayBySymbol("BTC").burn(_to, _amount);
        emit Withdrawal(_to, burnedAmount, _msg);
        return burnedAmount;
    }

    function swapRenBtcToWbtc(uint256 _amountIn) private returns(uint256){
        //Send RenBtc to Uniswap
        IERC20 renBTC = registry.getTokenBySymbol("BTC");
        renBTC.approve(address(uniswapRouter), _amountIn);
        address[] memory path = new address[](2);
        path[0] = address(renBTC);
        path[1] = address(wBTC);
        uint256[] memory amountsOut = uniswapRouter.getAmountsOut(_amountIn, path);
        uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            _amountIn,
            amountsOut[1],
            path,
            address(this),
            block.timestamp
        );
        //Obtained WBTC
        return amounts[1];
    }

    function swapWbtcToRenBtc(uint256 _amountIn) private returns(uint256) {
        //Send the WBTC to Uniswap
        wBTC.approve(address(uniswapRouter), _amountIn);
        IERC20 renBTC = registry.getTokenBySymbol("BTC");
        address[] memory path = new address[](2);
        path[0] = address(wBTC);
        path[1] = address(renBTC);
        uint256[] memory amountsOut = uniswapRouter.getAmountsOut(_amountIn, path);
        uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            _amountIn,
            amountsOut[1],
            path,
            address(this),
            block.timestamp
        );
        return amounts[1];
    }

    function wBtcToAave(uint256 _amount) private returns(uint256){
        //Send the WBTC to AAVE
        wBTC.approve(address(aAveLendingPoolCore), _amount);
        aAveLendingPool.deposit(address(wBTC), _amount, 0);
        /// We only borrow 25% of the colateral
        /// 1 is stable rate, 2 is variable rate
        //aAveLendingPool.borrow(address(usdC), amountOut / 4, 2, 0);
        aWbtc.transfer(msg.sender, _amount);
        return _amount;
    }

    function aAaveToWbtc(uint256 _amount) private returns(uint256) {
        //Withdraw the aWBTC to WBTC, the user needs to approve first
        aWbtc.transferFrom(msg.sender, address(this), _amount);
        aWbtc.redeem(_amount);
        return _amount;
    }

}
