const sketch = require('sketch');
const UI = require('sketch/ui');
const util = require('util');

const { DataSupplier } = sketch;

class Supplier {
  static supplyData(dataKey, data, index) {
    DataSupplier.supplyDataAtIndex(dataKey, data, index);
  }

  constructor(context, ids) {
    this.dataKey = context.data.key;
    this.items = util.toArray(context.data.items).map(sketch.fromNative);
    this.ids = ids;
    this.supply = this.supply.bind(this);

    // We need a counter of how many supply requests haven't yet completed. We
    // anticipate having one request per item.
    this.supplierTracker = this.items.length;

    // We also need a count of how many supply requests there were in total (1 per item).
    this.supplierStackCount = this.items.length;

    // We'll allocate a place to store an error message should one arise.
    this.errorMessage;

    // We need a success message to send once all the requests are done.
    this.successMessage = `Synthesized ${this.supplierStackCount} ${this.supplierStackCount === 1 ? 'compound' : 'compounds'} for you!`;
  }

  supply(worker) {
    this.items.forEach((item, index) => {
      const randomID = this.ids[Math.floor(Math.random() * this.ids.length)];

      worker(randomID).then((data) => {
        Supplier.supplyData(this.dataKey, data, index);
        this.supplierTracker--;
        if (this.supplierTracker === 0) {
          UI.message(this.errorMessage || this.successMessage);
        }
      })
      .catch(({ data, error }) => {
        Supplier.supplyData(this.dataKey, data, index);
        this.supplierTracker--;
        this.errorMessage = error;
        console.error(error);
        if (this.supplierTracker === 0) {
          UI.message(this.errorMessage || this.successMessage);
        }
      });
    });
  }
}

export default Supplier;
