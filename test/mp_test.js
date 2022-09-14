const Mp = artifacts.require("Mp");
const Order = artifacts.require("Order");

const {expectRevert, expectEvent, balance} = require('@openzeppelin/test-helpers');

const value = '1';

const weiValue = web3.utils.toWei(value);


const getBalance = async (acc) => {
  let b = await web3.eth.getBalance(acc);
  return web3.utils.fromWei(b, 'ether')
}


contract("Mp", function ([orderOwner, candidate1, candidate2]) {
  let inst

  beforeEach(async () => {
    inst = await Mp.new();
  })

  createOrder = async(addr, value=weiValue) => {
    return await inst.createOrder(10, "details", {value: value, from: addr})
  }

  it("should create order", async function () {
    const tx = await createOrder(orderOwner);
    expectEvent(tx, "OrderCreated");

    assert.equal(await inst.ordersAmount(), 1, "order was not created");

    let orderAddress = await inst.orders(0);
    assert.equal(await getBalance(orderAddress), value, "invalid order balance");

    let o = await Order.at(orderAddress);
    assert.equal(await o.state(), Order.OrderState.Created, "wrong state");
  });

  it("can't create order without value", async function () {
    await expectRevert(createOrder(orderOwner, 0), "reward must be set");
  });

  it("not owner can't cancel order", async () => {
    await createOrder(orderOwner);
    await expectRevert(inst.cancelOrder(0, {from: candidate1}), 'caller is not the owner');
  })

  it("should cancel order", async () => {
    await createOrder(orderOwner);
    const tx = await inst.cancelOrder(0, {from: orderOwner});
    expectEvent(tx, "OrderCancelled");

    assert.equal(await inst.ordersAmount(), 1, "order was not created");
    let o = await Order.at(await inst.orders(0));
    assert.equal(await o.state(), Order.OrderState.Cancelled, "wrong state");
  })

  it("can't accept cancelled order", async () => {
    await createOrder(orderOwner);
    await inst.cancelOrder(0, {from: orderOwner});
    await expectRevert(inst.becomeCandidate(0, {from: candidate1, value: weiValue}), 'invalid order state');
  })

  it("should become candidate", async () => {
    await createOrder(orderOwner);
    let balanceTracker = await balance.tracker(await inst.orders(0));
    await inst.becomeCandidate(0, {from: candidate1, value: weiValue});
    assert.equal(await balanceTracker.delta(), weiValue, "invalid initial order balance");
  })

  it("can't become candidate twice", async () => {
    await createOrder(orderOwner);
    await inst.becomeCandidate(0, {from: candidate1, value: weiValue});
    await expectRevert(inst.becomeCandidate(0, {from: candidate1, value: weiValue}), "already a candidate");
  })

  it("cancel being candidate", async () => {
    await createOrder(orderOwner);
    let balanceTracker = await balance.tracker(candidate2);

    await inst.becomeCandidate(0, {from: candidate2, value: weiValue});
    await inst.cancelBeingCandidate(0, {from: candidate2});

    let {delta, fees} = await balanceTracker.deltaWithFees();
    assert.equal(+delta + +fees, 0, "balance not reverted")
  })

});
