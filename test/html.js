"use strict";

var assert = require('assert'),
  ConformaError = require('../index');

describe('ConformaError', function() {

  it('should return html error', function() {
    var cf = new ConformaError();

    cf.addError('email', 'Wrong "Email"');
    cf.addError('email', 'Wrong Email Host');

    assert.strictEqual(cf.getHtmlError('email'), '<span class="help-block">Wrong &quot;Email&quot;<br>Wrong Email Host</span>');
  });

  it('should return html error list', function() {
    var cf = new ConformaError();

    cf.addError('email', 'Wrong "Email"');
    cf.addError('email', 'Wrong Email Host');

    assert.strictEqual(cf.getHtmlErrors(), '<ul><li>Wrong &quot;Email&quot;</li><li>Wrong Email Host</li></ul>');
  });
});
