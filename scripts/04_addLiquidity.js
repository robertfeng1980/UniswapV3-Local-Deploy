// Uniswap contract addresses
WETH_ADDRESS= '0x428aAe4Fa354c21600b6ec0077F2a6855C7dcbC8'
FACTORY_ADDRESS= '0x03BA748C043Ef8c2122f438fC4aB0ac41c276613'
SWAP_ROUTER_ADDRESS= '0x9C4a65D1cf0acc5CaA7643413A134AEE0C5066cC'
NFT_DESCRIPTOR_ADDRESS= '0x4c51C686CBE79e26B8Cc93b04BF0f530E7B0a872'
POSITION_DESCRIPTOR_ADDRESS= '0x3E5F619487FB074BEE52AA7764cCB51d9c0c2f17'
POSITION_MANAGER_ADDRESS= '0x6e345199d274269B43a19d67343d2132ea7fA378'
// Pool addresses
//USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'
USDT_USDC_500= '0x79A1c85CF3036ECfa46b53eD67580c9F60Cf0244'

// Token addresses
TETHER_ADDRESS= '0x45077109130e7F750bd5a4BC8ad94F859f6CA745'
USDC_ADDRESS= '0xbE61c8194d4C28a28356aAF0cC8A56dF5cB2aEbb'
WRAPPED_BITCOIN_ADDRESS= '0x0b19679bdEBA8Ae070534dA587cd4161D0053d75'

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main() {
  
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const signer2Privatekey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  const signer2 = new ethers.Wallet(signer2Privatekey, provider);


  const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  await usdtContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))
  await usdcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))

  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)

  const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  const pool = new Pool(
    UsdtToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('100000'),
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  console.log(amount0Desired.toString())
  console.log(amount1Desired)

  params = {
    token0: TETHER_ADDRESS,
    token1: USDC_ADDRESS,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: '1000000' }
  )
  const receipt = await tx.wait()
}

/*
npx hardhat run --network localhost scripts/04_addLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });