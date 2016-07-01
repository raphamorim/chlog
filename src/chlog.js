'use strict';

var Git = require('nodegit');

var packageJson = require('../package.json'),
    path = require('path'),
    utils = require('./utils');

var chlog = new Function();

chlog.prototype.version = function() {
    return packageJson.version;
}

chlog.prototype.run = function() {
    return Git.Repository.open(path.resolve(__dirname, "../.git"))
        .then(function(repo) {
            return repo.getCurrentBranch().then(function(ref) {
                // console.log("On " + ref.shorthand() + " (" + ref.target() + ")");
                return repo.getBranchCommit(ref.shorthand());
            }).then(function(commit) {
                /* Set up the event emitter and a promise to resolve when it finishes up. */
                var hist = commit.history(),
                    p = new Promise(function(resolve, reject) {
                        hist.on("end", resolve);
                        hist.on("error", reject);
                    });
                hist.start();
                return p;
            }).then(function(commits) {
                for (var i = 0; i < commits.length; i++) {
                    var sha = commits[i].sha().substr(0, 7),
                        msg = commits[i].message().split('\n')[0];
                    console.log(sha + " " + msg);
                }
            });
        }).catch(function(err) {
            console.log(err);
        }).done(function() {
            // console.log('Finished');
        });
}

module.exports = new chlog();