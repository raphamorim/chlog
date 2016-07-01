'use strict';

var chlog = require('./chlog'),
    verify = require('./utils').verify,
    commands = process.argv;

if (verify(['-v', '--version']))
    console.log(nativeCSS.version())
else
    console.log(chlog.run())
