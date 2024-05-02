const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
  let exchange, deployer, accounts, feeAccount, user1, user2, token1, token2;
  let transaction;

  const feePercent = 10;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];

    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(feeAccount.address, feePercent);

    const Token = await ethers.getContractFactory("Token");
    token1 = await Token.deploy("Gaston", "GSTN", "1000000");
    token2 = await Token.deploy("Ravel", "RVL", "1000000");

    transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait();

    transaction = await token2
      .connect(deployer)
      .transfer(user2.address, tokens(100));
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("tracks fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("tracks exchange fee", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });

    it("transfers token1 to user 1", async () => {
      expect(await token1.balanceOf(user1.address)).to.equal(tokens(100));
    });

    it("transfers token2 to user 2", async () => {
      expect(await token2.balanceOf(user2.address)).to.equal(tokens(100));
    });
  });

  describe("Depositing Tokens", () => {
    let transaction, result;
    let amount = tokens(100);

    describe("Seccess", () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
      });

      it("deposit tokens to exchange", async () => {
        expect(await token1.balanceOf(exchange.address)).to.be.equal(amount);
      });

      it("tracks user's balance within the exchange", async () => {
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
      });

      it("reads exchange's balance of function", async () => {
        expect(
          await exchange.exchangeBalanceOf(token1.address, user1.address)
        ).to.equal(amount);
      });

      it("emits deposit event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Deposit");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("fails when no tokens are approved", async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Withdrawing Tokens", () => {
    let transaction, result;
    let amount = tokens(100);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .withdrawToken(token1.address, amount);
      result = await transaction.wait();
    });

    describe("Seccess", () => {
      it("withdraws tokens from exchange", async () => {
        expect(await token1.balanceOf(exchange.address)).to.be.equal(0);
      });

      it("tracks user's balance within the exchange", async () => {
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          0
        );
      });

      it("reads exchange's balance of function", async () => {
        expect(
          await exchange.exchangeBalanceOf(token1.address, user1.address)
        ).to.equal(0);
      });

      it("emits withdraw event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Withdrawal");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      });
    });

    describe("Failure", () => {
      it("fails when trying to withdraw w/o depositing first", async () => {
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Checking Balances", () => {
    let transaction, result;
    let amount = tokens(1);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });

    it("returns user balance", async () => {
      expect(
        await exchange.exchangeBalanceOf(token1.address, user1.address)
      ).to.equal(amount);
    });
  });

  describe("Making Orders", () => {
    let transaction, result;
    let amountToken1, amountToken2, amount;
    amountToken1 = tokens(50);
    amountToken2 = tokens(50);
    amount = tokens(100);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });

    describe("Seccess", () => {
      beforeEach(async () => {
        transaction = await exchange
          .connect(user1)
          .makeOrder(
            token2.address,
            amountToken2,
            token1.address,
            amountToken1
          );
        result = await transaction.wait();
      });

      it("track the newly created order", async () => {
        expect(await exchange.orderCount()).to.equal(1);
      });

      it("emits order event", async () => {
        let now = await time.latest();
        const event = result.events[0];
        expect(event.event).to.equal("Order");

        const args = event.args;
        expect(args.id).to.equal(1);
        expect(args.user).to.equal(user1.address);
        expect(args.tokenGet).to.equal(token2.address);
        expect(args.amountGet).to.equal(amountToken2);
        expect(args.tokenGive).to.equal(token1.address);
        expect(args.amountGive).to.equal(amountToken1);
        expect(args.timestamp).to.equal(now);
      });
    });

    describe("Failure", () => {
      let invalidAmount = tokens(101);

      it("rejects orders with insufficient balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(
              token2.address,
              amountToken2,
              token1.address,
              invalidAmount
            )
        ).to.be.reverted;
      });
    });
  });

  describe("Order Actions", () => {
    let transaction, result;
    let amountToken1, amountToken2, amount;
    amountToken1 = tokens(1);
    amountToken2 = tokens(1);
    amount = tokens(50);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await token2
        .connect(user2)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user2)
        .depositToken(token2.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .makeOrder(token2.address, amountToken2, token1.address, amountToken1);
      result = await transaction.wait();
    });

    describe("Cancelling Orders", () => {
      describe("Seccess", () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
        });

        it("updates cancelled orders", async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it("emits cancel event", async () => {
          let now = await time.latest();
          const event = result.events[0];
          expect(event.event).to.equal("Cancel");

          const args = event.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user1.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(amountToken2);
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(amountToken1);
          expect(args.timestamp).to.equal(now);
        });
      });

      describe("Failure", () => {
        it("rejects cancelation of invalid order Ids", async () => {
          await expect(exchange.connect(user1).cancelOrder(2)).to.be.reverted;
        });

        it("rejects cancellation of order owned by other users", async () => {
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
        });
      });
    });

    describe("Filling Orders", () => {
      describe("Seccess", () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user2).fillOrder(1);
          result = await transaction.wait();
        });

        it("executes the trade and charges fees", async () => {
          expect(
            await exchange.exchangeBalanceOf(token1.address, user1.address)
          ).to.equal(tokens(49));
          expect(
            await exchange.exchangeBalanceOf(token1.address, user2.address)
          ).to.equal(tokens(1));

          expect(
            await exchange.exchangeBalanceOf(token2.address, feeAccount.address)
          ).to.equal(tokens(0.1));

          expect(
            await exchange.exchangeBalanceOf(token1.address, feeAccount.address)
          ).to.equal(tokens(0));

          expect(
            await exchange.exchangeBalanceOf(token2.address, user1.address)
          ).to.equal(tokens(1));

          expect(
            await exchange.exchangeBalanceOf(token2.address, user2.address)
          ).to.equal(tokens(48.9));
        });

        it("updates filled orders", async () => {
          expect(await exchange.orderFilled(1)).to.equal(true);
        });

        it("emits trade event", async () => {
          let now = await time.latest();
          const event = result.events[0];
          expect(event.event).to.equal("Trade");

          const args = event.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user2.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(amountToken2);
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(amountToken1);
          expect(args.creator).to.equal(user1.address);
          expect(args.timestamp).to.equal(now);
        });
      });

      describe("Failure", () => {
        it("rejects filling invalid order Ids", async () => {
          await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted;
        });

        it("rejects refilling orders", async () => {
          transaction = await exchange.connect(user2).fillOrder(1);
          result = await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
        });

        it("rejects filling cancelled orders", async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
        });
      });
    });
  });
});
