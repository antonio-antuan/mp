import {expect} from "chai";
import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

import {Doers, Mp, Order, Order__factory} from '../typechain-types'
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


const invalidStateErr = 'invalid order state'
const value = '0.0001';
const gwei = parseEth(value)

class Fixtures {
    mp: Mp
    doers: Doers;
    OrderFactory: Order__factory
    owner: SignerWithAddress
    candidate1: SignerWithAddress
    candidate2: SignerWithAddress
    candidate3: SignerWithAddress
    notADoer: SignerWithAddress;

    constructor(mp: Mp, doers: Doers, Order: Order__factory, owner: SignerWithAddress, candidate1: SignerWithAddress, candidate2: SignerWithAddress, candidate3: SignerWithAddress, notADoer: SignerWithAddress) {
        this.mp = mp
        this.doers = doers;
        this.OrderFactory = Order
        this.owner = owner
        this.candidate1 = candidate1
        this.candidate2 = candidate2
        this.candidate3 = candidate3
        this.notADoer = notADoer
    }
}

describe("Mp contract", function () {
    // todo: check emitted events
    // todo: create order not by contract owner
    async function deployTokenFixture(): Promise<Fixtures> {
        const mpFactory = await ethers.getContractFactory("Mp");
        const orderFactory = await ethers.getContractFactory("Order");
        const doersFactory = await ethers.getContractFactory("Doers");
        const setFactory = await ethers.getContractFactory("Set");
        const comFactory = await ethers.getContractFactory("Commission");
        const repFactory = await ethers.getContractFactory("Reputation");
        const [owner, candidate1, candidate2, candidate3, notADoer] = await ethers.getSigners();

        const doers = await doersFactory.deploy();
        await doers.newDoer(owner.address);
        await doers.newDoer(candidate1.address);
        await doers.newDoer(candidate2.address);
        await doers.newDoer(candidate3.address);

        const set = await setFactory.deploy();
        const com = await comFactory.deploy()
        const rep = await repFactory.deploy()
        const mp = await mpFactory.deploy(doers.address, set.address, com.address, rep.address);

        return new Fixtures(mp, doers, orderFactory, owner, candidate1, candidate2, candidate3, notADoer)
    }

    it("should create order", async function () {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(mp, owner)).to.emit(mp, "OrderCreated");

        expect(await mp.ordersAmount()).to.equal(1);

        let orderAddress = await mp.orders(0);
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(1, "invalid pending orders amount");
        expect(await getBalance(orderAddress)).to.equal(gwei);
    });

    it("should increase priority", async function () {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(mp, owner)).to.emit(mp, "OrderCreated");

        let minCommission = await mp.minCommissionForPriority(0);
        await expect(mp.connect(owner).increaseOrderPriority(0, {value: minCommission.toNumber()-1})).to.revertedWith("commission is not enough");
        await expect(mp.connect(owner).increaseOrderPriority(0, {value: minCommission})).to.changeEtherBalance(owner, -minCommission);

        let orderAddress = await mp.orders(0);
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(0, "invalid pending orders amount");
        expect(await mp.pendingOrdersOfPriorityCount(1)).to.equal(1, "invalid pending orders amount");
        expect(await getBalance(orderAddress)).to.equal(gwei);
    });

    it("can't create order without reward", async function () {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(mp, owner, "0")).to.revertedWith("reward must be set")
    });


    it("should create two orders with same owner", async () => {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        expect(await mp.ordersAmount()).to.eq(0)
        await createOrder(mp, owner);
        await createOrder(mp, owner);
        expect(await mp.ordersAmount()).to.eq(2)
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(2, "invalid pending orders amount");
    })

    it("should create several orders with several owners", async () => {
        const {owner, mp, candidate1, candidate2} = await loadFixture(deployTokenFixture)
        expect(await mp.ordersAmount()).to.eq(0)
        await createOrder(mp, owner);
        await createOrder(mp, owner);
        await createOrder(mp, candidate1);
        await createOrder(mp, candidate2);
        await createOrder(mp, candidate1);
        await createOrder(mp, candidate2);
        expect(await mp.ordersAmount()).to.eq(6)
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(6, "invalid pending orders amount");
    })

    it("can't create order without value", async function () {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        await expect(createOrder(mp, owner, "0")).to.be.revertedWith("reward must be set");
    });

    it("not owner can't cancel order", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);
        await expect(mp.connect(candidate1).cancelOrder(0)).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it("should cancel order", async () => {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        const val = "0.009876"
        await createOrder(mp, owner, val);
        await expect(mp.cancelOrder(0, {from: owner.address})).to.emit(mp, "OrderCancelled").to.changeEtherBalance(owner, parseEth(val));
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(0, "invalid pending orders amount");

        expect(await mp.ordersAmount()).to.equal(1, "order was not created");
    })

    it("can't accept cancelled order", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);
        await mp.cancelOrder(0, {from: owner.address});
        await expect(mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.be.revertedWith(invalidStateErr);
    })

    it("should become candidate", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);
        await expect(mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate1, -gwei);
    })

    it("owner can't be candidate", async () => {
        const {owner, mp} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);
        await expect(mp.connect(owner).becomeCandidate(0, {value: gwei})).revertedWith("owner of order can't be a candidate")
    })


    it("can't become candidate if not enough value", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        const lockValue = 1000;
        await createOrder(mp, owner, "10", 1000);
        await expect(mp.connect(candidate1).becomeCandidate(0, {value: lockValue - 1})).to.be.revertedWith("value must be greater or equal than order lockValue");
    })

    it("should become candidate if value is greater or equal than lock value", async () => {
      const fixtures = await loadFixture(deployTokenFixture)
      const minLockValue = 1000;
      const firstLockValue = minLockValue;
      const secondLockValue = minLockValue + 1;
      const thirdLockValue = minLockValue + 9243121973;
      const rewardValue = "1"

      await createOrder(fixtures.mp, fixtures.owner, rewardValue, 1000);

      let orderAddress = await fixtures.mp.orders(0);

      await expect(fixtures.mp.connect(fixtures.candidate1).becomeCandidate(0, {value: secondLockValue})).changeEtherBalance(orderAddress, secondLockValue)
      await expect(fixtures.mp.connect(fixtures.candidate2).becomeCandidate(0, {value: firstLockValue})).changeEtherBalance(orderAddress, firstLockValue)
      await expect(fixtures.mp.connect(fixtures.candidate3).becomeCandidate(0, {value: thirdLockValue})).changeEtherBalance(orderAddress, thirdLockValue)
    })

    it("can't become candidate twice", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);
        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await expect(mp.connect(candidate1).becomeCandidate(0, {value: gwei})).to.be.revertedWith("already a candidate");
    })

    it("cancel being candidate", async () => {
        const {owner, mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await expect(mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
        await expect(mp.connect(candidate2).cancelBeingCandidate(0)).to.changeEtherBalance(candidate2, gwei);

    })

    it("can't cancel being candidate twice", async () => {
        const {owner, mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate2).cancelBeingCandidate(0);
        await expect(mp.connect(candidate2).cancelBeingCandidate(0)).to.be.revertedWith("already rejected");
    })

    it("should become candidate after cancel", async () => {
        const {owner, mp, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await expect(mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
        await expect(mp.connect(candidate2).cancelBeingCandidate(0)).to.changeEtherBalance(candidate2, gwei);
        await expect(mp.connect(candidate2).becomeCandidate(0, {value: gwei})).to.changeEtherBalance(candidate2, -gwei);
    })

    it("should choose candidate", async () => {
        const {owner, mp, OrderFactory, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address)
        let order = await OrderFactory.attach(await mp.orders(0))
        expect(await order.executor()).to.eq(candidate1.address);
    })

    it("should choose revert money for not chosen candidate", async () => {
        const {owner, mp, candidate1, candidate2, candidate3} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate3).becomeCandidate(0, {value: gwei});
        expect(await mp.chooseCandidate(0, candidate1.address)).to.changeEtherBalance(candidate2, gwei).to.changeEtherBalance(candidate3, gwei)
    })

    it("can't choose candidate twice", async () => {
        const {owner, mp, candidate1, candidate2, candidate3} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate3).becomeCandidate(0, {value: gwei});
        await expect(mp.chooseCandidate(0, candidate2.address)).to.changeEtherBalance(candidate1, gwei).to.changeEtherBalance(candidate3, gwei);
        await expect(mp.chooseCandidate(0, candidate2.address)).to.revertedWith(invalidStateErr);
    })

    it("should approved by executor", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address);

        await mp.connect(candidate1).approveByExecutor(0)
        expect(await mp.pendingOrdersOfPriorityCount(0)).to.equal(0, "invalid pending orders amount");
    })

    it("not approved by candidate", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});

        await expect(mp.connect(candidate1).approveByExecutor(0)).to.revertedWith(invalidStateErr);
    })

    it("can't cancel approved order", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});

        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).approveByExecutor(0);

        await expect(mp.cancelOrder(0)).to.revertedWith(invalidStateErr)
    })

    it("can't cancel being candidate", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).approveByExecutor(0);

        await expect(mp.connect(candidate1).cancelBeingCandidate(0)).to.revertedWith(invalidStateErr);
    })

    it("can't change candidate after approve", async () => {
        const {owner, mp, candidate1, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate2).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address);
        await expect(mp.chooseCandidate(0, candidate2.address)).to.revertedWith(invalidStateErr);
    })

    it("should cancel by executor and assign to another candidate", async () => {
        const {owner, mp, candidate1, candidate2} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.connect(candidate2).becomeCandidate(0, {value: gwei});

        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).cancelByExecutor(0);

        await mp.chooseCandidate(0, candidate2.address);
        await mp.connect(candidate2).cancelByExecutor(0);

        await mp.chooseCandidate(0, candidate2.address);
        await mp.connect(candidate2).approveByExecutor(0);
    })

    it("should mark as ready", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).approveByExecutor(0);

        await mp.connect(candidate1).markAsReady(0);
    })


    it("should mark as failed", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        await createOrder(mp, owner);

        const locked = parseEth("1");
        await mp.connect(candidate1).becomeCandidate(0, {value: locked});
        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).approveByExecutor(0);

        await expect(mp.connect(candidate1).markAsFailed(0)).to.changeEtherBalance(owner, locked);
    })

    it("should mark as completed", async () => {
        const {owner, mp, candidate1} = await loadFixture(deployTokenFixture)
        const reward = "1"
        await createOrder(mp, owner, reward);

        await mp.connect(candidate1).becomeCandidate(0, {value: gwei});
        await mp.chooseCandidate(0, candidate1.address);
        await mp.connect(candidate1).approveByExecutor(0);
        await mp.connect(candidate1).markAsReady(0);

        await expect(mp.markAsDone(0)).to.changeEtherBalance(candidate1, parseEth(reward));
    })

});
