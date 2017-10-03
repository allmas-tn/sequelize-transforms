'use strict';

var Sequelize = require('sequelize');

var defaultTransforms = {
  trim: function(val, definition) {
    return definition['trim'] && val ? val.toString().trim() : val;
  },
  lowercase: function(val, definition) {
    return definition['lowercase'] && val ? val.toString().toLowerCase() : val;
  },
  uppercase: function(val, definition) {
    return definition['uppercase'] && val ? val.toString().toUpperCase() : val;
  }
};

function init(Sequelize, target, transforms) {
  if (Sequelize.Model.isPrototypeOf(target)) {
    transforms = Object.assign({}, defaultTransforms, transforms || {});

    var names = Object.keys(transforms);
    var refresh = false;

    Object.keys(target.rawAttributes).forEach(function(attr) {
      var definition = target.rawAttributes[attr];
      var localTransforms = [];

      names.forEach(function(name) {
        if (definition.hasOwnProperty(name)) {
          localTransforms.push(function(val) {
            return transforms[name](val, definition);
          });
        }
      });

      if (localTransforms.length) {
        refresh = true;

        var $set = definition.set || null;

        definition.set = function(val) {
          var self = this;

          localTransforms.forEach(function(fn) {
            val = fn.call(self, val);
          });

          if ($set)
            return $set.call(this, val);
          else
            return this.setDataValue(attr, val);
        }
      }
    });

    if (refresh)
      target.refreshAttributes();
  }
  else {
    Sequelize.afterDefine(function(Model) {
      init(Sequelize, Model, transforms);
    });
  }
}

module.exports = init;
