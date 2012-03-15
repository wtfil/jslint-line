var fs = require('fs'),
  vm = require('vm'),
  tty = require('tty'),
  options = {},
  files = [],
  fileToCheck,
  result,
  everythingFine = true,
  errors,
  i,
  end = false,
  jslint,
  jslintPath = '/usr/share/jslint/jslint.js',
  match;
function report(fileName, errors) {
  console.log("\n\033[01;31m----------------------JSLINT ERRORS-------------------------------\033[00;00m\n\n");
  var linesLeft = 50; //tty.getWindowSize()-5;
  errors.forEach(function (error) {
    if (!error || linesLeft < 5 ) {
      return;
    }
    console.log('%s:%d:%d', fileName, error.line, error.character);
    console.log(error.reason);
    linesLeft -= 2;
    if (error.evidence) {
      console.log(error.evidence);
      console.log(Array(error.character).map(function () {return ''}).join(' ')+'^'); 
      linesLeft -= 2;
    }
    console.log('');
    linesLeft -= 1; 
  });
}
function applyProfile(options) {
  var profile = options.profile,
    profileOptionsPath = process.env.HOME + '/.jslint',
    profileOptions,
    homeFile,
    key;
  if (!profile) {
    return;
  }
  try {
    homeFile = '(' + fs.readFileSync(profileOptionsPath, 'UTF-8') + ')';
  } catch (fsError) {
    return;
  }
  try {
    profileOptions = vm.runInThisContext(homeFile);
  } catch (vmError) {
    console.log(vmError);
    return;
  }
  if (!profileOptions[profile]) {
    console.log('no such profile "%s" in %s', profile, profileOptionsPath);
    return;
  }
  for (key in profileOptions[profile]) {
    options[key] = profileOptions[profile][key];
  }
}
function help(jslint) {
  var st = [
    '--anon       if the space may be omitted in anonymous function declarations' ,
    '--bitwise    if bitwise operators should be allowed' ,
    '--browser    if the standard browser globals should be predefined' ,
    '--cap        if upper case HTML should be allowed' ,
    '--continue   if the continuation statement should be tolerated' ,
    '--css        if CSS workarounds should be tolerated' ,
    '--debug      if debugger statements should be allowed' ,
    '--devel      if logging should be allowed (console, alert, etc.)' ,
    '--eqeq       if == should be allowed' ,
    '--es5        if ES5 syntax should be allowed' ,
    '--evil       if eval should be allowed' ,
    '--forin      if for in statements need not filter' ,
    '--fragment   if HTML fragments should be allowed' ,
    '--indent     the indentation factor' ,
    '--maxerr     the maximum number of errors to allow' ,
    '--maxlen     the maximum length of a source line' ,
    '--newcap     if constructor names capitalization is ignored' ,
    '--node       if Node.js globals should be predefined' ,
    '--nomen      if names may have dangling _' ,
    '--on         if HTML event handlers should be allowed' ,
    '--passfail   if the scan should stop on first error' ,
    '--plusplus   if increment/decrement should be allowed' ,
    '--properties if all property names must be declared with /*properties*/' ,
    '--regexp     if the . should be allowed in regexp literals' ,
    '--rhino      if the Rhino environment globals should be predefined' ,
    '--undef      if variables can be declared out of order' ,
    '--unparam    if unused parameters should be tolerated' ,
    '--sloppy     if the "use strict"; pragma is optional' ,
    '--sub        if all forms of subscript notation are tolerated' ,
    '--vars       if multiple var statements per function should be allowed' ,
    '--white      if sloppy whitespace is tolerated' ,
    '--widget     if the Yahoo Widgets globals should be predefined' ,
    '--windows    if MS Windows-specific globals should be predefined',
    '--profile    to load options set from ~/.jslint',
    '  ex:        {',
    '               myprofile: {',
    '                 node: true',
    '               }',
    '             }',
    '--help       to see this message againt'
  ].join('\n');
  console.log(st);
}
for (i = 2; i < process.argv.length; i++) {
  match = process.argv[i].match(/\-\-(\w+)$/);
  if (match) {
    options[match[1]] = true;
    continue;
  } 
  match = process.argv[i].match(/\-\-(\w+)=(["'\w,\s]+)$/);
  if (match) {
    options[match[1]] = match[2];
    continue;
  } 
  files.push(process.argv[i]);
}
options.predef = options.predef ? options.predef.split(/\s*,\s*/) : [];
jslint = fs.readFileSync(jslintPath, 'UTF-8');
vm.runInThisContext(jslint);
if (options.help || !files.length) {
  help(jslint);
  process.exit();
}
// geting profile from home directory
applyProfile(options);
files.forEach(function (fileName) {
  if (!everythingFine) {
    return;
  }
  try {
    fileToCheck = fs.readFileSync(fileName, 'UTF-8');
  } catch (e) {
    console.log('no such file "' + fileName + '"');
    everythingFine = false;
    return;
  }
  result = JSLINT(fileToCheck, options);
  if (!result) {
    report(fileName, JSLINT.errors);
    everythingFine = false;
  }
});
if (everythingFine) {
  console.log('You code like a GOD');
}
