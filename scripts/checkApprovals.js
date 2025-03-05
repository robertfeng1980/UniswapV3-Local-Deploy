TETHER_ADDRESS= '0x45077109130e7F750bd5a4BC8ad94F859f6CA745'
USDC_ADDRESS= '0xbE61c8194d4C28a28356aAF0cC8A56dF5cB2aEbb'
WRAPPED_BITCOIN_ADDRESS= '0x0b19679bdEBA8Ae070534dA587cd4161D0053d75'

const swapRouterAddress = '0x9C4a65D1cf0acc5CaA7643413A134AEE0C5066cC'; 

const {ethers, waffle} = require('hardhat');
const {Contract} = require("ethers");
const ERC20ABI = require('../ERC20.json'); 

const ownerPrivateKey = process.env.PRIVATE_KEY;
const signer2Privatekey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);
const signer2 = new ethers.Wallet(signer2Privatekey, provider);


const artifacts = {
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json")
};



async function main(){

    //const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;
    const USDTToken = new Contract(TETHER_ADDRESS, artifacts.Usdt.abi, provider);
    const USDCToken = new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider);
    const allowedT = await USDTToken.connect(signer2).allowance(signer2.address,swapRouterAddress);
    const allowedC = await USDCToken.connect(signer2).allowance(signer2.address,swapRouterAddress);
    console.log(`Allowed USDT:  ${allowedT}`);
    console.log(`Allowed USDC:  ${allowedC}`);

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });