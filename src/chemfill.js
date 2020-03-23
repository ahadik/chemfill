import SVGToPng from './utils';

const sketch = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const UI = require('sketch/ui');
const util = require('util');
const fs = require('@skpm/fs');
const path = require('path');
const os = require('os');

const { DataSupplier } = sketch;

const RESOURCE_PATH = '../Resources/';

const wittyIntroMessages = [
  'Grabbing you a compound...',
  'Watch out Walter White!',
  'Hitting up the supply cabinet...',
  'Welcome to Chemistry 101!',
  'Let\'s get chemical!'
]

const idsFileRaw = fs.readFileSync(path.resolve(path.join(RESOURCE_PATH, 'chembl-ids.json')));
// Extract the IDs from the seed JSON file.
const { ids } = JSON.parse(idsFileRaw);

const FOLDER = path.join(os.tmpdir(), 'com.sketchapp.chemofill-plugin');
let test;

export function onStartup(a) {
  test = a;
  // To register the plugin, uncomment the relevant type:
  // DataSupplier.registerDataSupplier('public.text', 'chemofill', 'SupplyData')
  DataSupplier.registerDataSupplier('public.image', 'Random Structure', 'SupplyRandomStructure');
}

export function onShutdown() {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers();

  try {
    if (fs.existsSync(FOLDER)) {
      fs.rmdirSync(FOLDER);
    }
  } catch (err) {
    console.error(err);
  }
}



export function onSupplyRandomStructure(context) {
  UI.message(wittyIntroMessages[Math.floor(Math.random() * wittyIntroMessages.length)]);
  const dataKey = context.data.key;
  const items = util.toArray(context.data.items).map(sketch.fromNative);
  const Converter = new SVGToPng(document, RESOURCE_PATH, FOLDER);
  let supplierStackCount = 0;
  let supplierStack = [];
  items.forEach((item, index) => {
    const randomID = ids[Math.floor(Math.random() * ids.length)];
    supplierStack.push(randomID);
    supplierStackCount++;
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/image/${randomID}?format=svg`;

    Converter.saveStructureAsPng(structureURL).then((pngPath) => {
      if (!pngPath) {
        console.error('I dunno... There\'s no image path even though we got this far...');
        return;
      }
      DataSupplier.supplyDataAtIndex(dataKey, pngPath, index);
      supplierStack.pop();
      if (supplierStack.length === 0) {
        UI.message(`Synthesized ${supplierStackCount} ${supplierStackCount === 1 ? 'compound' : 'compounds'} for you!`)
      }
    });
  })
}
