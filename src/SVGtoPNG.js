import path from'path';
import sketch from 'sketch/dom';

import APIFetcher from './APIFetcher';

class SVGToPNG {
  constructor(document, resource_path, temp_dir) {
    this.document = document;
    this.resource_path = resource_path;
    this.temp_dir = temp_dir;
    
    this.saveStructureAsPng = this.saveStructureAsPng.bind(this);
    this.insertSVG = this.insertSVG.bind(this);
    this.saveSVGLayer = this.saveSVGLayer.bind(this);
  }

  saveStructureAsPng(url) {
    return new Promise((res, rej) => {
      APIFetcher(url, 'text')
        .then(this.insertSVG)
        .then(this.saveSVGLayer)
        .then((pngString) => {
          res(pngString);
        })
        .catch((err) => {
          rej({data: path.resolve(path.join(this.resource_path, 'default-structure.png')), error: `${err} Returning a default structure instead.` });
        });
    })
  }

  insertSVG(svgString) {
    const svgData = svgString.dataUsingEncoding(NSUTF8StringEncoding);
    const guid = NSProcessInfo.processInfo().globallyUniqueString();
    const svgImporter = MSSVGImporter.svgImporter();
    svgImporter.prepareToImportFromData(svgData);
    const svgLayer = svgImporter.importAsLayer();
    svgLayer.setName(guid);
    this.document.pages[0].layers.push(svgLayer)
    return svgLayer;
  }

  saveSVGLayer(svgLayer) {
  
    try {
      sketch.export(svgLayer, {
        formats: 'png',
        scales: "3",
        output: this.temp_dir
      });
      svgLayer.removeFromParent();
      return(path.join(this.temp_dir,`${svgLayer.name()}@3x.png`));
    } catch (err) {
      console.error(err);
    }
  }
}

export default SVGToPNG;
