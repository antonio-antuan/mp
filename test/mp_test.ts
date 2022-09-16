import {expect} from "chai";
import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

import {Mp, Order, Order__factory} from '../typechain-types'
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "ethers";


const getBalance = async (acc: string): Promise<BigNumber> => {
    return await ethers.provider.getBalance(acc);
}


const parseEth = (val: string): BigNumber => {
    return ethers.utils.parseEther(val)
}

const createOrder = async (mp: Mp, addr: SignerWithAddress, val: string = value, lockValInWei: number = 10): Promise<ContractTransaction> => {
    return await mp.connect(addr).createOrder(lockValInWei, "details", {value: parseEth(val)})
}


const value = '0.0001';
const gwei = parseEth(value)

class Fixtures {
    Mp: Mp
    OrderFactory: Order__factory
    owner: SignerWithAddress
    candidate1: SignerWithAddress
    candidate2: SignerWithAddress
    candidate3: SignerWithAddress

    constructor(Mp: Mp, Order: Order__factory, owner: SignerWithAddress, candidate1: SignerWithAddress, candidate2: SignerWithAddress, candidate3: SignerWithAddress) {
        this.Mp = Mp
        this.OrderFactory = Order
        this.owner = owner
        this.candidate1 = candidate1
        this.candidate2 = candidate2
        this.candidate3 = candidate3
    }
}

describe("Mp contract", function () {
    async function deployTokenFixture(): Promise<Fixtures> {
        const mpFactory = await ethers.getContractFactory("Mp");
        const order = await ethers.getContractFactory("Order");
        const [owner, candidate1, candidate2, candidate3] = await ethers.getSigners();

        const mp = await mpFactory.deploy();

        return new Fixtures(mp, order, owner, candidate1, candidate2, candidate3)
    }

    it("should create order", async function () {
        const {owner, Mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(Mp, owner)).to.emit(Mp, "OrderCreated");

        expect(await Mp.ordersAmount()).to.equal(1);

        let orderAddress = await Mp.orders(0);
        expect(await getBalance(orderAddress)).to.equal(gwei);
    });

    it("can't create order without reward", async function () {
        const {owner, Mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(Mp, owner, "0")).to.revertedWith("reward must be set")
    });


    it("should create two orders with same owner", async () => {
        const {owner, Mp} = await loadFixture(deployTokenFixture)
        expect(await Mp.ordersAmount()).to.eq(0)
        await createOrder(Mp, owner);
        await createOrder(Mp, owner);
        expect(await Mp.ordersAmount()).to.eq(2)
    })

    it("should create several orders with several owners", async () => {
        const {owner, Mp, candidate1, candidate2} = await loadFixture(deployTokenFixture)
        expect(await Mp.ordersAmount()).to.eq(0)
        await createOrder(Mp, owner);
        await createOrder(Mp, owner);
        await createOrder(Mp, candidate1);
        await createOrder(Mp, candidate2);
        await createOrder(Mp, candidate1);
        await createOrder(Mp, candidate2);
        expect(await Mp.ordersAmount()).to.eq(6)
    })

    it("can't create order without value", async function () {
        const {owner, Mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(Mp, owner, "0")).to.be.revertedWith("reward must be set");
    });

    it("not owner can't cancel order", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await expect(Mp.connect(candidate1).cancelOrder(0)).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it("should cancel order", async () => {
        const {owner, Mp} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await expect(Mp.cancelOrder(0, {from: owner.address})).to.emit(Mp, "OrderCancelled");

        expect(await Mp.ordersAmount()).to.equal(1, "order was not created");
    })

    it("can't accept cancelled order", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await Mp.cancelOrder(0, {from: owner.address});
        await expect(Mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.be.revertedWith('invalid order state');
    })

    it("should become candidate", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await expect(Mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate1, -gwei);
    })

    it("owner can't be candidate", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await expect(Mp.connect(owner).becomeCandidate(0, {value: gwei})).revertedWith("owner of order can't be a candidate")
    })


    it("can't become candidate if not enough value", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        const lockValue = 1000;
        await createOrder(Mp, owner, "10", 1000);
        await expect(Mp.connect(candidate1).becomeCandidate(0, {value: lockValue - 1})).to.be.revertedWith("value must be greater or equal than order lockValue");
    })

    it("should become candidate if value is greater or equal than lock value", async () => {
      const fixtures = await loadFixture(deployTokenFixture)
      const minLockValue = 1000;
      const firstLockValue = minLockValue;
      const secondLockValue = minLockValue + 1;
      const thirdLockValue = minLockValue + 9243121973;
      const rewardValue = "1"

      await createOrder(fixtures.Mp, fixtures.owner, rewardValue, 1000);

      let orderAddress = await fixtures.Mp.orders(0);

      await expect(fixtures.Mp.connect(fixtures.candidate1).becomeCandidate(0, {value: secondLockValue})).changeEtherBalance(orderAddress, secondLockValue)
      await expect(fixtures.Mp.connect(fixtures.candidate2).becomeCandidate(0, {value: firstLockValue})).changeEtherBalance(orderAddress, firstLockValue)
      await expect(fixtures.Mp.connect(fixtures.candidate3).becomeCandidate(0, {value: thirdLockValue})).changeEtherBalance(orderAddress, thirdLockValue)
    })

    it("can't become candidate twice", async () => {
        const {owner, Mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);
        await Mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await expect(Mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.be.revertedWith("already a candidate");
    })

    it("cancel being candidate", async () => {
        const {owner, Mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await expect(Mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
        await expect(Mp.connect(candidate2).cancelBeingCandidate(0)).to.changeEtherBalance(candidate2, gwei);

    })

    it("can't cancel being candidate twice", async () => {
        const {owner, Mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await Mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await Mp.connect(candidate2).cancelBeingCandidate(0);
        await expect(Mp.connect(candidate2).cancelBeingCandidate(0)).to.be.revertedWith("already rejected");
    })

    it("should become candidate after cancel", async () => {
        const {owner, Mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await expect(Mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
        await expect(Mp.connect(candidate2).cancelBeingCandidate(0)).to.changeEtherBalance(candidate2, gwei);
        await expect(Mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
    })

    it("should choose candidate", async () => {
        const {owner, Mp, OrderFactory, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await Mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await Mp.chooseCandidate(0, candidate1.address)
        let order = await OrderFactory.attach(await Mp.orders(0))
        expect(await order.executor()).to.eq(candidate1.address);
    })

    it("should choose revert money for not chosen candidate", async () => {
        const {owner, Mp, candidate1, candidate2, candidate3} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await Mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await Mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await Mp.connect(candidate3).becomeCandidate(0, {value: gwei});
        expect(await Mp.chooseCandidate(0, candidate1.address)).to.changeEtherBalance(candidate2, gwei).to.changeEtherBalance(candidate3, gwei)
    })

    it("can't choose candidate twice", async () => {
        const {owner, Mp, candidate1, candidate2, candidate3} = await loadFixture(deployTokenFixture)
        await createOrder(Mp, owner);

        await Mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await Mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await Mp.connect(candidate3).becomeCandidate(0, {value: gwei});
        await expect(Mp.chooseCandidate(0, candidate2.address)).to.changeEtherBalance(candidate1, gwei).to.changeEtherBalance(candidate3, gwei);
        await expect(Mp.chooseCandidate(0, candidate2.address)).to.revertedWith("invalid order state");
    })

});
