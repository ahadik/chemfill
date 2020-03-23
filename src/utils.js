import path from'path';
import sketch from 'sketch/dom';
import { rejects } from 'assert';

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
      fetch(url)
      .then((res) => {
        return res.text()._value;
      })
      .then(this.insertSVG)
      .then(this.saveSVGLayer)
      .then((pngString) => {
        res(pngString);
      })
      .catch((err) => {
        console.error(err);
        res(path.resolve(path.join(this.resource_path, 'default-structure.png')));
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
      fs.mkdirSync(this.temp_dir);
    } catch (err) {
      // meh
    }
  
    try {
      sketch.export(svgLayer, {
        formats: 'png',
        output: this.temp_dir
      });
      svgLayer.removeFromParent();
      return(path.join(this.temp_dir,`${svgLayer.name()}.png`));
    } catch (err) {
      console.error(err);
    }
  }
}

export default SVGToPNG;
