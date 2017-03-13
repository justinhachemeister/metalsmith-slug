var path      = require('path');
var slug      = require('slug');
var minimatch = require('minimatch');

module.exports = plugin;

function matchGlobArray (file, patterns) {
  return patterns.some(function (pattern) {
    return minimatch(file, pattern, { matchBase: true });
  });
}

function saveSlug (files, file, opts, slugOpts) {
  var currFile = files[file];
  var str = currFile.slug || currFile[opts.property];
  if (str === undefined || str === null) return;

  var newSlug = slug(str, slugOpts);

  if (opts.renameFiles) {
    var currPath = path.dirname(file);
    var currExt = path.extname(file);
    var slugFilename = path.join(currPath, newSlug + currExt);

    if (slugFilename !== file) {
      files[slugFilename] = currFile;
      delete files[file];
    }
  }

  currFile.slug = newSlug;
}

function plugin (opts) {
  // Plugin options
  opts = opts || {};
  opts.lower = opts.lower || opts.lowercase; // 'lowercase' for backward compatibility
  opts.mode = opts.mode || slug.defaults.mode;
  opts.property = opts.property || 'title';
  opts.renameFiles = opts.renameFiles || false;

  // Slug options
  var slugOpts     = {};
  var slugDefaults = slug.defaults.modes[opts.mode];

  Object.keys(slugDefaults).forEach(function (slugOpt) {
    slugOpts[slugOpt] = opts[slugOpt] || slugDefaults[slugOpt];
  });

  return function (files, metalsmith, done) {
    opts.patterns = opts.patterns || ['**'];

    var matchedFiles = Object.keys(files).filter(function (file) {
      return matchGlobArray(file, opts.patterns);
    });

    matchedFiles.forEach(function (file) {
      saveSlug(files, file, opts, slugOpts);
    });

    done();
  };
}
