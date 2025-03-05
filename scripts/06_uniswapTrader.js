// Import ethers from Hardhat, not directly from the ethers package
const { ethers } = require("hardhat");
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;
const SwapRouterABI = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json').abi;
const ERC20ABI = require('../ERC20.json'); 
const { getPoolImmutables, getPoolState } = require('./helpers')

const ownerPrivateKey = process.env.PRIVATE_KEY;
const signer2Privatekey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);
const signer2 = new ethers.Wallet(signer2Privatekey, provider);

async function main() {
    // Use Hardhat's provider and signers
    //const [owner, signer2] = await ethers.getSigners();
    //const provider = waffle.provider;

    // Example addresses, replace these with your local Hardhat deployed addresses
    const poolAddress = '0x79A1c85CF3036ECfa46b53eD67580c9F60Cf0244'; // Your local Uniswap Pool address
    const swapRouterAddress = '0x9C4a65D1cf0acc5CaA7643413A134AEE0C5066cC'; // Your local Uniswap SwapRouter address

    // Initialize contracts with the local signer
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
    const swapRouterContract = new ethers.Contract(swapRouterAddress, SwapRouterABI, provider);

 
    const name0 = 'USDT';
    const symbol0 = 'USDT';
    const decimals0 = 18;
    const address0 = '0x45077109130e7F750bd5a4BC8ad94F859f6CA745';

    const name1 = 'USDC';
    const symbol1 = 'USDC';
    const decimals1 = 18;
    const address1 = '0xbE61c8194d4C28a28356aAF0cC8A56dF5cB2aEbb'; 

    // Define the swap parameters
    const inputAmount = ethers.utils.parseUnits("1", decimals0);
    const approvalAmount = inputAmount.mul(100000);

    // Approve the SwapRouter to spend token
    const tokenContract0 = new ethers.Contract(address0, ERC20ABI, provider);
    const tokenContract1 = new ethers.Contract(address1, ERC20ABI, provider);

    await tokenContract0.connect(signer2).approve(swapRouterAddress, approvalAmount);
    await tokenContract1.connect(signer2).approve(swapRouterAddress, approvalAmount);

    // Set up swap parameters
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: 500,
        recipient: signer2.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: inputAmount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    // Execute the swap
    const transaction = await swapRouterContract.connect(signer2).exactInputSingle(params, {
        gasLimit: ethers.utils.hexlify(1000000)
    });

    console.log(`Transaction hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
