'use strict';

var _ = require('lodash');
var Sequelize = require('sequelize');

var defaultTransforms = {
  trim: function(val, definition) {
    return definition['trim'] ? val.toString().trim() : val;
  },
  lowercase: function(val, definition) {
    return definition['lowercase'] ? val.toString().toLowerCase() : val;
  },
  uppercase: function(val, definition) {
    return definition['uppercase'] ? val.toString().toUpperCase() : val;
  }
};

function init(target, transforms) {
  if (target instanceof Sequelize.Model) {
    transforms = _.defaults(_.clone(transforms || {}), defaultTransforms);

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
    target.afterDefine(function(Model) {
      init(Model, transforms);
    });
  }
}

module.exports = init;
