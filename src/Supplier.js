const sketch = require('sketch');
const UI = require('sketch/ui');
const util = require('util');
const fs = require('@skpm/fs');
const path = require('path');

const { DataSupplier } = sketch;

class Supplier {
  static supplyData(dataKey, data, index) {
    DataSupplier.supplyDataAtIndex(dataKey, data, index);
  }

  constructor(context, resourcePath) {
    this.supplierStack = [];
    this.supplierStackCount = 0;
    this.dataKey = context.data.key;
    this.items = util.toArray(context.data.items).map(sketch.fromNative);
    const idsFileRaw = fs.readFileSync(path.resolve(path.join(resourcePath, 'chembl-ids.json')));
    
    // Extract the IDs from the seed JSON file.
    const { ids } = JSON.parse(idsFileRaw);
    this.ids = ids;
    this.supply = this.supply.bind(this);
  }

  supply(worker) {
    this.items.forEach((item, index) => {
      const randomID = this.ids[Math.floor(Math.random() * this.ids.length)];
      this.supplierStack.push(randomID);
      this.supplierStackCount++;

      worker(randomID).then((data) => {
        Supplier.supplyData(this.dataKey, data, index);
        this.supplierStack.pop();
        if (this.supplierStack.length === 0) {
          UI.message(`Synthesized ${this.supplierStackCount} ${this.supplierStackCount === 1 ? 'compound' : 'compounds'} for you!`)
        }
      })
      .catch((errorObj) => {
        Supplier.supplyData(this.dataKey, errorObj.data, index);
        this.supplierStack.pop();
        if (this.supplierStack.length === 0) {
          console.error(errorObj.error);
          UI.message(errorObj.error);
        }
      });
    });
  }
}

export default Supplier;
