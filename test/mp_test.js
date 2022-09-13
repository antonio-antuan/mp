const MpTest = artifacts.require("Mp");

const {expectRevert, expectEvent, time} = require('@openzeppelin/test-helpers');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Mp", function (/* accounts */) {
  it("should create order", async function () {
    const inst = await MpTest.new()

    const receipt = await inst.createOrder(10, "details", {value: web3.utils.toWei('1')})

    assert.equal(await inst.ordersAmount(), 1, "order was not created");

    let o = await inst.orders(0);
    assert.equal(await o.state(), "foo", "wrong state");

    expectEvent(receipt, "OrderCreated");
  });
});
