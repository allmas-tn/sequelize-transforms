'use strict';

var assert = require('assert');
var _ = require('lodash');
var Sequelize = require('sequelize');
var sequelizeTransforms = require('..');

var sequelize;
var testString = '  Test String  ';

var modelDefinition = {
  noTransforms: {
    type: Sequelize.STRING
  },
  trim: {
    type: Sequelize.STRING,
    trim: true
  },
  lowercase: {
    type: Sequelize.STRING,
    lowercase: true
  },
  uppercase: {
    type: Sequelize.STRING,
    uppercase: true
  },
  combined: {
    type: Sequelize.STRING,
    trim: true,
    lowercase: true
  },
  customSetter: {
    type: Sequelize.STRING,
    trim: true,
    lowercase: true,
    set: function(val) {
      return this.setDataValue('customSetter', val + '##');
    }
  },
  customTransform: {
    type: Sequelize.STRING,
    append: '(postfix)'
  }
};

var instanceDefinition = {
  noTransforms: testString,
  trim: testString,
  lowercase: testString,
  uppercase: testString,
  combined: testString,
  customSetter: testString,
  customTransform: testString
};

function defineModel() {
  // use a deep clone because sequelizeTransforms will modify the model definition by adding/replacing setters
  return sequelize.define('Model', _.cloneDeep(modelDefinition));
}

describe('Sequelize transforms', function() {

  beforeEach(function() {
    sequelize = new Sequelize('db', 'u', 'p', {dialect: 'sqlite'});
  });

  it('default transforms should not fail for null values', function() {
    sequelizeTransforms(sequelize);

    var Model = defineModel();

    assert.doesNotThrow(function() {
      Model.build({
        trim: null,
        lowercase: null,
        uppercase: null
      });
    });
  });

  it('should run default transforms on configured attributes', function() {
    sequelizeTransforms(sequelize);

    var Model = defineModel();
    var instance = Model.build(instanceDefinition);

    assert.strictEqual(instance.noTransforms, '  Test String  ');
    assert.strictEqual(instance.trim, 'Test String');
    assert.strictEqual(instance.lowercase, '  test string  ');
    assert.strictEqual(instance.uppercase, '  TEST STRING  ');
    assert.strictEqual(instance.combined, 'test string');
    assert.strictEqual(instance.customSetter, 'test string##');
    assert.strictEqual(instance.customTransform, '  Test String  ');
  });

  it('should run custom transforms', function() {
    sequelizeTransforms(sequelize, {
      trim: function(val, defintion) {
        return val.toString().replace(/ /g, '*');
      },
      append: function(val, definition) {
        return val.toString() + definition['append'];
      }
    });

    var Model = defineModel();
    var instance = Model.build(instanceDefinition);

    assert.strictEqual(instance.noTransforms, '  Test String  ');
    assert.strictEqual(instance.trim, '**Test*String**');
    assert.strictEqual(instance.lowercase, '  test string  ');
    assert.strictEqual(instance.uppercase, '  TEST STRING  ');
    assert.strictEqual(instance.combined, '**test*string**');
    assert.strictEqual(instance.customSetter, '**test*string**##');
    assert.strictEqual(instance.customTransform, '  Test String  (postfix)');
  });

  it('should allow configuration on model', function() {
    var Model = defineModel();

    var instance = Model.build(instanceDefinition);

    assert.strictEqual(instance.trim, '  Test String  ');

    sequelizeTransforms(Model);
    instance = Model.build(instanceDefinition);

    assert.strictEqual(instance.trim, 'Test String');
  });

});
