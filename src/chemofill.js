const sketch = require('sketch');
const util = require('util');
const fs = require('@skpm/fs');
const path = require('path');
const os = require('os');

const { DataSupplier } = sketch;

const RESOURCE_PATH = '../Resources/';

const idsFileRaw = fs.readFileSync(path.resolve(path.join(RESOURCE_PATH, 'chembl-ids.json')));
// Extract the IDs from the seed JSON file.
const { ids } = JSON.parse(idsFileRaw);

const FOLDER = path.join(os.tmpdir(), 'com.sketchapp.chemofill-plugin');

export function onStartup() {
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

function saveImageData(imageBlob) {
  const guid = NSProcessInfo.processInfo().globallyUniqueString();
  const imagePath = path.join(FOLDER, `${guid}.png`);

  try {
    fs.mkdirSync(FOLDER);
  } catch (err) {
    // meh
  }

  try {
    fs.writeFileSync(imagePath, imageBlob, 'NSData');
    return imagePath;
  } catch (err) {
    console.error(err);
  }

  return undefined;
}

function getStructureImageFromURL(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(saveImageData)
    .catch((err) => {
      console.error(err);
      return path.resolve(path.join(RESOURCE_PATH, 'default-structure.png'));
    });
}

export function onSupplyRandomStructure(context) {
  const dataKey = context.data.key;
  const items = util.toArray(context.data.items).map(sketch.fromNative);
  items.forEach((item, index) => {
    const randomID = ids[Math.floor(Math.random() * ids.length)];
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/image/${randomID}`;

    getStructureImageFromURL(structureURL).then((imagePath) => {
      if (!imagePath) {
        console.error('I dunno... There\'s no image path even though we got this far...');
        return;
      }

      DataSupplier.supplyDataAtIndex(dataKey, imagePath, index);
    });
  });
}
