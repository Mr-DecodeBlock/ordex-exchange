const chai = require('chai');
const assert = chai.assert;

const OrderMatchingEngine = require('../lib/order-matching-engine');

function makeOrder(address, sourceToken, targetToken, sourceAmount, targetAmount, isExpired) {
  return {address, sourceToken, targetToken, sourceAmount, targetAmount,
          timestamp: 10, expiry: isExpired ? 8 : 10};
}

function makeOrders(lastIsExpired) {
  const testOrder1 = makeOrder('addr1', 'ETH', 'BTC', 100, 100, false);
  const testOrder2 = makeOrder('addr2', 'BTC', 'ETH', 100, 100, false);
  const testOrder3 = makeOrder('addr3', 'BTC', 'ETH', 100, 90, false);
  const testOrder4 = makeOrder('addr4', 'ETH', 'BTC', 45, 50, false);
  const testOrder5 = makeOrder('addr5', 'ETH', 'BTC', 69, 75, lastIsExpired);

  return [testOrder1, testOrder2, testOrder3, testOrder4, testOrder5];
}


describe('OrderHeap', function () {
  function makeMatchingEngine(orders) {
    return new OrderMatchingEngine('ETH', 'BTC', orders, () => Promise.resolve(9));
  }

  it('should work in simple cases', async function () {
    const orders = [makeOrder('addr1', 'ETH', 'BTC', 1, 1, false),
                    makeOrder('addr2', 'BTC', 'ETH', 1, 1, false)];
    const engine = makeMatchingEngine(orders);
    const transactions = await engine.matchOrders();
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].sourceAmount, 1);
    assert.equal(transactions[0].targetAmount, 1);
  });

  it('should match multiple transcations', async function () {
    const engine = makeMatchingEngine(makeOrders(false));
    const transactions = await engine.matchOrders();
    assert.equal(transactions.length, 2);
    assert.equal(transactions[0].sourceAmount, 69);
    assert.equal(transactions[0].targetAmount, 75);
  });

  it('should not use expired transcations', async function () {
    const engine = makeMatchingEngine(makeOrders(true));
    const transactions = await engine.matchOrders();
    assert.equal(transactions.length, 1);
  });
});