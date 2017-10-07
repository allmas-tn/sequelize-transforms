# Sequelize Transforms

[Sequelize](https://github.com/sequelize/sequelize) plugin to add configurable attribute transforms. It allows you to
define transform functions (aka filters) to run on attribute values when an instance is updated (through assignment,
`set`, `build`, `create` etc.). The transform functions can be enabled and configured on attribute level.

## Installation

```sh
npm install sequelize-transforms
```

## Activation

### Globally

To activate the plugin for all your models, call the plugin on your `sequelize` instance:

```js
var sequelizeTransforms = require('sequelize-transforms');

sequelizeTransforms(sequelize);
```

### Per Model

To activate the plugin on specific models, call the plugin on the models:

```js
var sequelizeTransforms = require('sequelize-transforms');

var Model = sequelize.define('Model', { /* model definition */ });
sequelizeTransforms(sequelize, Model);
```

## Usage

To use transforms for an attribute, just add them to its definition:

```js
var Model = sequelize.define('Model', {
  email: {
    type: Sequelize.STRING,
    lowercase: true,
    trim: true
  }
});
````

With this configuration, the `email` attribute will always be trimmed and transformed to lower case.

## Predefined Transforms

The plugin comes with the following predefined transforms:

* `trim`: trim value
* `lowercase`: transform value to all lower case
* `uppercase`: transform value to all upper case

## Custom Transforms

It is possible to override predefined transforms or add your own by passing an object as the second argument:

```js
sequelizeTransforms(sequelize, null, {
  trim: function(val, defintion) {
    return val.toString().replace(/ /g, '*');
  },
  append: function(val, definition) {
    return val.toString() + definition['append'];
  }
});
```

This would override the `trim` transform and add a new one called `append`. Every transform function is called with
two parameters: the value to transform and the definition of the attribute being transformed.

## Notes

* If more than one transform is defined on an attribute, then the order in which they are executed is unpredictable.
This is generally not an issue as you should not use mutually exclusive transforms together, e.g. `lowercase` and `uppercase`.
* If an attribute is updated with the `raw` option set to `true`, then the transforms will not be run.
