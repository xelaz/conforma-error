'use strict';

var debug = require('debug')('conforma-error'),
  entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

/**
 *
 * @constructor
 */
var ConformaError = function(options) {
  options = options || {};
  this.__ = options.__ || function(v) {return v};

  this.openTag = options.openTag || '<span class="help-block">';
  this.separator = options.separator || '<br>';
  this.closeTag = options.closeTag || '</span>';
  this.openListTag = options.openListTag || '<ul>';
  this.closeListTag = options.closeListTag || '</ul>';

  this.reset();
};

/**
 *
 * @param {array} err
 * @param {string} [namespace]
 *
 * @returns {ConformaError}
 */
ConformaError.prototype.addMongoError = function(err, namespace) {
  if(!err || err.name === 'ConformaError') {
    return this;
  }

  debug('addMongoError', err);

  err = err || {};
  var _self = this, m;

  if(err && err.name && err.name === 'MongoError') {
    if(err.err && err.err.indexOf('duplicate key error')) {
      m = err.err.match(/index\:(.*[^\s](\$(.*)\_+\d))(\s\s)/);

      if(m && m[3]) {
        _self.addError((namespace ? namespace + '.' : '') + m[3], 'duplicate key');
      }
      return this;
    }
  }

  if(typeof err.errors !== 'undefined' && Object.keys(err.errors).length) {
    Object.keys(err.errors).forEach(function(key) {
      if(err.errors[key].path && err.errors[key].message) {
        _self.addError((namespace ? namespace + '.' : '') + key, err.errors[key].message);
      }
    });
  } else if(typeof err.path !== 'undefined' && err.path !== null && err.message) {
    this.addError((namespace ? namespace + '.' : '') + err.path, err.message);
  }

  return this;
};

/**
 * @param {array} err
 * @param {string} [namespace] prefix path
 *
 * @return {ConformaError}
 */
ConformaError.prototype.addConformaError = function(err, namespace) {
  if(!err || err.name !== 'ConformaError') {
    return this;
  }

  debug('addConformaError', err);

  var _self = this;

  err = err.errors || [];

  Object.keys(err).forEach(function(key) {
    var tmpError = err[key];

    _self.addError(
      (namespace ? namespace + '.' : '') + tmpError.field,
      tmpError.message,
      {
        value: tmpError.value,
        min: tmpError.min || '',
        max: tmpError.max || ''
      }
    );
  });

  return this;
};

/**
 * @param {String} path
 * @param {String} message
 * @param {String} [options]
 * @param {String} [options.value]
 * @param {String} [options.min]
 * @param {String} [options.max]
 *
 * @return ConformaError
 */
ConformaError.prototype.addError = function(path, message, options) {
  if(!path || !message) {
    return this;
  }

  if(!this.errors[path]) {
    this.errors[path] = [];
  }

  message = this.__(message)
    .replace(/(\:[a-z]*\:)/g, function(match) {
      var result = match && match.replace(/\:/g, '');
      switch(result) {
        case 'path':
          result =  this.__(path);
          break;
        case 'value':
          result = options.value || '';
          break;
        case 'min':
          result = options.min || '';
          break;
        case 'max':
          result = options.max || '';
          break;
        default:
          result = '';
      }
      return result;
    })
    .replace(/\s{2,}/, ' ').replace("''", '').replace('""', '');

  var messageHash = path+message;

  if(this.duplicate.indexOf(messageHash) < 0) {
    this.errors[path].push(message);
    this.duplicate.push(messageHash);
  }

  return this;
};

/**
 * @param {string} path
 * @returns {Array}
 */
ConformaError.prototype.getError = function(path) {
  return this.hasError(path) && this.errors[path] || [];
};

/**
 * @returns {string}
 */
ConformaError.prototype.getErrors = function() {
  return this.errors;
};

/**
 *
 * @param {String} key
 * @param {*}  [custom]
 *
 * @returns {*}
 */
ConformaError.prototype.hasError = function(key, custom) {
  return typeof this.errors[key] !== 'undefined' ? (custom || true) : false;
};

/**
 * @returns {Boolean|*}
 */
ConformaError.prototype.hasErrors = function(returnValue) {
  return Object.keys(this.errors).length ? (returnValue || true) : false;
};

/**
 *
 * @param {string} path
 *
 * @returns {ConformaError}
 */
ConformaError.prototype.remove = function(path) {
  if(this.hasError(path)) {
    this.errors[path] = null;
    delete this.errors[path];
  }

  return this;
};

/**
 * @returns {ConformaError}
 */
ConformaError.prototype.reset = function() {
  this.errors = {};
  this.duplicate = [];

  return this;
};

/**
 *
 * @returns {string}
 */
ConformaError.prototype.getHtmlErrors = function(openTag, closeTag) {
  var str = openTag || this.openListTag, _self = this;

  Object.keys(this.errors).forEach(function(path) {
    str += _self.getHtmlError(path, '<li>', '</li><li>', '</li>');
  });

  str += closeTag || this.closeListTag;

  return str;
};

/**
 * @param {string} path
 * @param {string} [openTag]
 * @param {string} [separator]
 * @param {string} [closeTag]
 *
 * @returns {string}
 */
ConformaError.prototype.getHtmlError = function(path, openTag, separator, closeTag) {
  var errors = this.getError(path).map(function(value) {
    return escapeHtml(value.trim());
  });

  openTag = openTag || this.openTag;
  separator = separator || this.separator;
  closeTag = closeTag || this.closeTag;

  return errors.length ? (openTag + errors.join(separator) + closeTag) : '';
};


module.exports = ConformaError;