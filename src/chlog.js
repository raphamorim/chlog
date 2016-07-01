'use strict';

var Git = require('nodegit'),
    promise = require('bluebird'),
    exec = promise.promisify(require('child_process').exec);

var packageJson = require('../package.json'),
    path = require('path'),
    utils = require('./utils');

var chlog = new Function();

chlog.prototype.version = function() {
    return packageJson.version;
}

chlog.prototype.run = function() {
    var gitRepo = null,
        generatedLog = "",
        tags = {};

    return Git.Repository.open(path.resolve(__dirname, "../.git"))
        .then(function(repo) {
            gitRepo = repo;
            return Git.Tag.list(gitRepo).then(function(refs) {
                for (var i = 0; i < refs.length; i++) {
                    tags[refs[i]] = [];
                }
                return gitRepo.getCurrentBranch().then(function(ref) {
                    return gitRepo.getBranchCommit(ref.shorthand());
                }).then(function(commit) {
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
                        return getCommitTag(sha).then(function(tag) {
                            if (tag) {
                                tags[tag].push(action);
                            }
                        });
                    }
                });
            }).catch(function(err) {
                console.log(err);
            }).done(function() {
                console.log(tags['v0.1.1']);
                console.log(tags['v0.1.0']);
            });
        });
}

function getCommitTag(sha) {
    return exec('git describe --exact-match ' + sha)
        .then(function(version) {
            return version.trim();
        }).catch(function() {
            return null;
        })
}

module.exports = new chlog();