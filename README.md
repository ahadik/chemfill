![ChemoFill](https://github.com/ahadik/chemofill/blob/master/docs/banner.png)

# ChemoFill

This Sketch Data Plugin fetches a random molecule from the ChEMBL (https://www.ebi.ac.uk/chembl/) API and returns a rendering of its structure as PNG image. This can be incredibly useful for designing software for the life sciences where chemical structures might be a common form of data rendered.

## Features and Usage

Once you have installed the ChemoFill plugin, you can access it from the Sketch Data menu.

A common use case is replacing a rectangular shape with an image fill:

Step 1: Select and right click on the shape you would like to insert a Chemical structure into.

![Step 1: Draw and select a rectangular shape](https://github.com/ahadik/chemofill/blob/master/docs/step-1.png)

Step 2: Select Data from the context menu

<img src="https://github.com/ahadik/chemofill/blob/master/docs/step-2.png" width="200">

Step 3: Select the Random Structure action

<img src="https://github.com/ahadik/chemofill/blob/master/docs/step-3.png" width="200">

Step 4: Enjoy your chemical mastery

![Step 4: Enjoy your chemical mastery](https://github.com/ahadik/chemofill/blob/master/docs/step-4.png)

## Installation

_Requires Sketch >= 3_

* [Download](https://github.com/mathieudutour/sketch-styles-hierarchy/releases/latest) the latest release
* Un-zip
* Double click the plugin file to install.

## Developing

### Getting Started

Install the dependencies

```bash
yarn install
```

Once the installation is done, you can run some commands inside the project folder:

```bash
yarn build
```

To watch for changes:

```bash
yarn run watch
```

Additionally, if you wish to run the plugin every time it is built:

```bash
yarn start
```

### Debugging

To view the output of your `console.log`, you have a few different options:

* Use the [`sketch-dev-tools`](https://github.com/skpm/sketch-dev-tools)
* Open `Console.app` and look for the sketch logs
* Look at the `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log` file

Skpm provides a convenient way to do the latter:

```bash
skpm log
```

The `-f` option causes `skpm log` to not stop when the end of logs is reached, but rather to wait for additional data to be appended to the input
