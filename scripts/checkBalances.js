// Token addresses
TETHER_ADDRESS= '0x45077109130e7F750bd5a4BC8ad94F859f6CA745'
USDC_ADDRESS= '0xbE61c8194d4C28a28356aAF0cC8A56dF5cB2aEbb'
WRAPPED_BITCOIN_ADDRESS= '0x0b19679bdEBA8Ae070534dA587cd4161D0053d75'

const { Contract } = require("ethers")

const artifacts = {
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    WrappedBTC: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json")
  };

const ownerPrivateKey = process.env.PRIVATE_KEY;
const signer2Privatekey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);
const signer2 = new ethers.Wallet(signer2Privatekey, provider);

async function main(){
    //const [owner,signer2] = await ethers.getSigners();
    //const provider = waffle.provider;

    const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
    const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)
    const BtcContract = new Contract(WRAPPED_BITCOIN_ADDRESS,artifacts.WrappedBTC.abi,provider)

    UsdtBalance = await usdtContract.balanceOf(signer2.address)
    UsdcBalance = await usdcContract.balanceOf(signer2.address)
    BtcBalance = await BtcContract.balanceOf(signer2.address)

    console.log('USDT Value=', `'${UsdtBalance}'`)
    console.log('USDC Value=', `'${UsdcBalance}'`)
    console.log('WrappedBTC Value=', `'${BtcBalance}'`)
}

/*
npx hardhat run --network localhost scripts/checkBalances.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });