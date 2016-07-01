'use strict';

var Git = require('nodegit');

var packageJson = require('../package.json'),
    path = require('path'),
    utils = require('./utils');

var chlog = new Function(),
    log = "";

chlog.prototype.version = function() {
    return packageJson.version;
}

chlog.prototype.run = function() {
    var gitRepo = null;
    return Git.Repository.open(path.resolve(__dirname, "../.git"))
        .then(function(repo) {
            gitRepo = repo;
            return gitRepo.getCurrentBranch().then(function(ref) {
                // console.log("On " + ref.shorthand() + " (" + ref.target() + ")");
                return gitRepo.getBranchCommit(ref.shorthand());
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

                    var action = "- " + utils.capitalizeFirstLetter(msg) + " (" + sha + ")";
                    console.log(action);
                    log = log + '\n' + action;
                }

                return Git.Tag.list(gitRepo).then(function(refs) {
                    console.log(refs);
                });
            });
        }).catch(function(err) {
            console.log(err);
        }).done(function() {
            console.log(log);
        });
}

module.exports = new chlog();