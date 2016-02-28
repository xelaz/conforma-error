'use strict';

var assert = require('assert'),
  ConformaError = require('../index'),
  Conforma = require('conforma');

describe('ConformaError', function() {

  it('should have error on conforma error', function() {
    var cf = new ConformaError();

    var errors = [
      new Conforma.ConformaValidationError('email', 'msg'),
      new Conforma.ConformaValidationError('password', 'msg')
    ];

    var error = new Conforma.ConformaError('ERROR', errors);

    cf.addConformaError(error);
    assert.ok(cf.hasError('email'));
    assert.ok(cf.hasError('password'));
    assert.ok(cf.hasErrors());
  });

  it('should not have error on other error', function() {
    var cf = new ConformaError();

    var error = new Error('ERROR');

    cf.addConformaError(error);
    assert.ok(!cf.hasErrors());
  });

  it('should not have error on conforma validation error', function() {
    var cf = new ConformaError();

    var error = new Conforma.ConformaValidationError('email', 'msg');

    cf.addConformaError(error);
    assert.ok(cf.hasErrors());
    assert.ok(cf.hasError('email'));
  });

  it('should not have error on empty error', function() {
    var cf = new ConformaError();

    cf.addConformaError();
    assert.ok(!cf.hasErrors());
  });
});