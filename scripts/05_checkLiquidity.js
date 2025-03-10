// pool
USDT_USDC_500= '0x79A1c85CF3036ECfa46b53eD67580c9F60Cf0244'

const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const { Contract } = require("ethers")

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
    liquidity: liquidity.toString(),
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}


async function main() {
  const provider = waffle.provider;
  const poolContract = new Contract(USDT_USDC_500, UniswapV3Pool.abi, provider)
  const poolData = await getPoolData(poolContract)
  console.log('poolData', poolData)
}

/*
npx hardhat run --network localhost scripts/05_checkLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });