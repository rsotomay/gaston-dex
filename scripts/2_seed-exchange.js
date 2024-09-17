const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  //Fetch Accounts
  const accounts = await ethers.getSigners();

  // Fetch Network
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chainId: ${chainId}`);
  //Fetch token contracts
  // Fetch GASton Token
  const gstn = await ethers.getContractAt(
    "Token",
    config[chainId].gstn.address
  );
  console.log(`Gaston Token fetched: ${gstn.address}\n`);

  // Fetch Ravel Token
  const rvl = await ethers.getContractAt("Token", config[chainId].rvl.address);
  console.log(`Ravel Token fetched: ${rvl.address}\n`);

  // Fetch mETH Token
  const mETH = await ethers.getContractAt(
    "Token",
    config[chainId].mETH.address
  );
  console.log(`mETH Token fetched: ${mETH.address}\n`);

  // Fetch exchange contract
  const exchange = await ethers.getContractAt(
    "Exchange",
    config[chainId].exchange.address
  );
  console.log(`exchange contract fetched: ${exchange.address}\n`);

  // Distribute tokens
  const sender = accounts[0];
  const receiver = accounts[1];
  const amount = tokens(10000);

  //Give mETH tokens to account[2]
  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  result = await transaction.wait();
  console.log(
    `Transferred ${amount} mETH tokens from ${sender.address} to ${receiver.address}\n`
  );

  //Set up exchange users
  const user1 = accounts[0];
  const user2 = accounts[1];
  amount;
  // User1 approves 10,000 gstn tokens
  transaction = await gstn.connect(user1).approve(exchange.address, amount);
  result = await transaction.wait();
  console.log(
    `Approved ${amount} gstn tokens from ${user1.address} to ${exchange.address}\n`
  );

  //User1 deposits the approved gstn token amount
  transaction = await exchange
    .connect(user1)
    .depositToken(gstn.address, amount);
  result = await transaction.wait();
  console.log(
    `Deposit ${amount} gstn tokens from ${user1.address} to ${exchange.address}\n`
  );

  // User2 approves 10,000 mETH tokens
  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  result = await transaction.wait();
  console.log(
    `Approved ${amount} mETH tokens from ${user2.address} to ${exchange.address}\n`
  );

  //User2 deposits the approved mETH token amount
  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  result = await transaction.wait();
  console.log(
    `Deposit ${amount} mETH tokens from ${user2.address} to ${exchange.address}\n`
  );

  //////////////////////////////////////////////////////////////////////////////
  // Seed cancel order
  //

  // User1 makes order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), gstn.address, tokens(5));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User1 cancels order
  let orderId;
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Order cancelled by ${user1.address}\n`);

  // Wait 1 second
  await wait(1);

  /////////////////////////////////////////////////////////////////////////////
  // Seed filled ordes
  //

  //User1 makes order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), gstn.address, tokens(10));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User2 fills the order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Order filled from ${user2.address}\n`);

  // Wait 1 second
  await wait(1);

  //User1 makes another order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), gstn.address, tokens(15));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User2 fills another order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Order filled from ${user2.address}\n`);

  // Wait 1 second
  await wait(1);

  //User1 makes another order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), gstn.address, tokens(20));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User2 fills another order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Order filled from ${user2.address}\n`);

  // Wait 1 second
  await wait(1);

  /////////////////////////////////////////////////////////////////////////////
  // Seed Open ordes
  //

  // user1 makes 10 orders
  console.log("Now user1 opens 10 orders...\n");
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), gstn.address, tokens(10));
    result = await transaction.wait();
    console.log(
      `Made order from ${user1.address} of ${i * 10} mETH for 10 gstn\n`
    );
    // Wait 1 second
    await wait(1);
  }

  // User2 makes 10 orders
  console.log("Now user2 opens 10 orders...\n");
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(gstn.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait();
    console.log(
      `Made order from ${user2.address} of 10 gstn for ${i * 10} mETH\n`
    );
    // Wait 1 second
    await wait(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
