"use strict";

var assert = require("assert"),
  ConformaError = require('../index');

describe('ConformaError', function() {

  it('should not add message without path', function() {
    var cf = new ConformaError();
    cf.addError();
    assert.strictEqual(cf.hasErrors(), false);
  });

  it('should not add message without message', function() {
    var cf = new ConformaError();
    cf.addError('email');
    assert.strictEqual(cf.hasErrors(), false);
  });

  it('should add message', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.hasErrors(), true);
  });

  it('should preserve add overwrite message with path', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.getErrors().email.length, 1);
  });

  it('should add messages with path', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    cf.addError('email', 'Wrong Email Two');
    assert.strictEqual(cf.getErrors().email.length, 2);
  });

  it('should has errors boolean', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.hasErrors(), true);
  });

  it('should has errors return custom value', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.hasErrors('string'), 'string');
  });

  it('should not has errors', function() {
    var cf = new ConformaError();
    assert.strictEqual(cf.hasErrors(), false);
  });

  it('should has error', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.hasError('email'), true);
  });

  it('should not has error on unknown path', function() {
    var cf = new ConformaError();
    cf.addError('mail', 'Wrong Email');
    assert.strictEqual(cf.hasError('email'), false);
  });

  it('should has error return custom value', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email');
    assert.strictEqual(cf.hasError('email', 'has-error'), 'has-error');
  });

  it('should remove error by path', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email').remove('email');
    assert.strictEqual(cf.hasErrors(), false);
  });

  it('should not remove on unknown path', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email').remove('mail');
    assert.strictEqual(cf.hasErrors(), true);
  });

  it('should reset', function() {
    var cf = new ConformaError();
    cf.addError('email', 'Wrong Email').reset();
    assert.strictEqual(cf.hasErrors(), false);
  });
});
