const { Contract, ContractFactory, utils, BigNumber } = require("ethers")

  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const signer2Privatekey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  const signer2 = new ethers.Wallet(signer2Privatekey, provider);
async function main() {
    //const [owner, signer2] = await ethers.getSigners();
  
    Tether = await ethers.getContractFactory('Tether', owner);
    tether = await Tether.deploy();
  
    Usdc = await ethers.getContractFactory('UsdCoin', owner);
    usdc = await Usdc.deploy();
  
    WrappedBitcoin = await ethers.getContractFactory('WrappedBitcoin', owner);
    wrappedBitcoin = await WrappedBitcoin.deploy();
  
    await tether.connect(owner).mint(
      signer2.address,
      ethers.utils.parseEther('100000')
    )
    await usdc.connect(owner).mint(
      signer2.address,
      ethers.utils.parseEther('100000')
    )
    await wrappedBitcoin.connect(owner).mint(
      signer2.address,
      ethers.utils.parseEther('100000')
    )
  
    console.log('TETHER_ADDRESS=', `'${tether.address}'`)
    console.log('USDC_ADDRESS=', `'${usdc.address}'`)
    console.log('WRAPPED_BITCOIN_ADDRESS=', `'${wrappedBitcoin.address}'`)
  }
  
  /*
  npx hardhat run --network localhost scripts/02_deployTokens.js
  */
  
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });