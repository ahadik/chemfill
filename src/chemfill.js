import SVGToPng from './SVGtoPNG';
import Supplier from './Supplier';
import APIFetcher from './APIFetcher';

const sketch = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const UI = require('sketch/ui');
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
  'Let\'s get chemical!',
  'You can’t trust an atom, they make up everything. Fetching you a molecule instead.',
  'Let\'s put the "cool" back in molecule!'
];

const FOLDER = path.join(os.tmpdir(), 'com.sketchapp.chemofill-plugin');

export function onStartup(a) {
  // To register the plugin, uncomment the relevant type:
  DataSupplier.registerDataSupplier('public.text', 'SMILES String', 'SupplyRandomSMILES');
  DataSupplier.registerDataSupplier('public.text', 'Molecular Formula', 'SupplyRandomFormula');
  DataSupplier.registerDataSupplier('public.text', 'Molecular Weight', 'SupplyRandomWeight');
  DataSupplier.registerDataSupplier('public.image', 'Molecular Structure', 'SupplyRandomStructure');
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

function showWaitingMessage() {
  UI.message(wittyIntroMessages[Math.floor(Math.random() * wittyIntroMessages.length)]);
}

export function onSupplyRandomSMILES(context) {
  showWaitingMessage();

  const supplier = new Supplier(context, RESOURCE_PATH);

  supplier.supply((chemblID) => {
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/molecule/${chemblID}?format=json`;
    return APIFetcher(structureURL, 'json').then((jsonBlob) => {
      return jsonBlob.molecule_structures.canonical_smiles;
    });
  });
}

export function onSupplyRandomFormula(context) {
  showWaitingMessage();

  const supplier = new Supplier(context, RESOURCE_PATH);

  supplier.supply((chemblID) => {
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/molecule/${chemblID}?format=json`;
    return APIFetcher(structureURL, 'json').then((jsonBlob) => {
      return jsonBlob.molecule_properties.full_molformula;
    });
  });
}

export function onSupplyRandomWeight(context) {
  showWaitingMessage();

  const supplier = new Supplier(context, RESOURCE_PATH);

  supplier.supply((chemblID) => {
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/molecule/${chemblID}?format=json`;
    return APIFetcher(structureURL, 'json').then((jsonBlob) => {
      return jsonBlob.molecule_properties.full_mwt;
    });
  });
}

export function onSupplyRandomStructure(context) {
  showWaitingMessage();

  const supplier = new Supplier(context, RESOURCE_PATH);
  const svgToPng = new SVGToPng(document, RESOURCE_PATH, FOLDER);

  supplier.supply((chemblID) => {
    const structureURL = `https://www.ebi.ac.uk/chembl/api/data/image/${chemblID}?format=svg`;
    return svgToPng.saveStructureAsPng(structureURL).then((pngPath) => {
      if (!pngPath) {
        console.error('I dunno... There\'s no image path even though we got this far...');
        return;
      }
      return pngPath;
    });
  });
}
