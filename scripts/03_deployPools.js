// Token addresses

TETHER_ADDRESS= '0x45077109130e7F750bd5a4BC8ad94F859f6CA745'
USDC_ADDRESS= '0xbE61c8194d4C28a28356aAF0cC8A56dF5cB2aEbb'
WRAPPED_BITCOIN_ADDRESS= '0x0b19679bdEBA8Ae070534dA587cd4161D0053d75'

// Uniswap contract address
WETH_ADDRESS= '0x428aAe4Fa354c21600b6ec0077F2a6855C7dcbC8'
FACTORY_ADDRESS= '0x03BA748C043Ef8c2122f438fC4aB0ac41c276613'
SWAP_ROUTER_ADDRESS= '0x9C4a65D1cf0acc5CaA7643413A134AEE0C5066cC'
NFT_DESCRIPTOR_ADDRESS= '0x4c51C686CBE79e26B8Cc93b04BF0f530E7B0a872'
POSITION_DESCRIPTOR_ADDRESS= '0x3E5F619487FB074BEE52AA7764cCB51d9c0c2f17'
POSITION_MANAGER_ADDRESS= '0x6e345199d274269B43a19d67343d2132ea7fA378'

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}


async function main() {
  const usdtUsdc500 = await deployPool(USDC_ADDRESS,TETHER_ADDRESS,  500, encodePriceSqrt(1, 1))
  console.log('USDT_USDC_500=', `'${usdtUsdc500}'`)
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });