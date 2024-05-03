async function main() {
  console.log("Preparing deployment...\n");

  let exchange, gsnt, rvl;
  //Ferch contract to deploy
  const Exchange = await ethers.getContractFactory("Exchange");
  const Token = await ethers.getContractFactory("Token");

  //Fetch Accounts
  const accounts = await ethers.getSigners();
  console.log(
    `Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`
  );
  //Deploy contract
  exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log(`Exchange deployed to ${exchange.address}`);

  gstn = await Token.deploy("Gaston", "GSTN", "1000000");
  await gstn.deployed();
  console.log(`Gaston Token deployed to ${gstn.address}`);

  rvl = await Token.deploy("Ravel", "RVL", "1000000");
  await rvl.deployed();
  console.log(`Ravel Token deployed to ${rvl.address}`);

  mETH = await Token.deploy("mETH", "mETH", "1000000");
  await mETH.deployed();
  console.log(`mETH Token deployed to ${mETH.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
