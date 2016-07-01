'use strict';

var promise = require('bluebird'),
    chlog = require('./chlog'),
    verify = require('./utils').verify,
    commands = process.argv;

if (verify(['-v', '--version']))
    console.log(nativeCSS.version())
else {
    chlog.run()
}
