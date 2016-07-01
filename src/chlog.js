'use strict';

var Git = require('nodegit');

var packageJson = require('../package.json'),
    utils = require('./utils');

var chlog = new Function();

chlog.prototype.version = function() {
    return packageJson.version;
}

chlog.prototype.run = function() {
    Git.Repository.open("tmp")
        // Open the master branch.
        .then(function(repo) {
            return repo.getMasterCommit();
        })
        // Display information about commits on master.
        .then(function(firstCommitOnMaster) {
            // Create a new history event emitter.
            var history = firstCommitOnMaster.history();

            // Create a counter to only show up to 9 entries.
            var count = 0;

            // Listen for commit events from the history.
            history.on("commit", function(commit) {
                // Disregard commits past 9.
                if (++count >= 1) {
                    return;
                }

                // Show the commit sha.
                console.log("commit " + commit.sha());

                // Store the author object.
                var author = commit.author();

                // Display author information.
                console.log("Author:\t" + author.name() + " <" + author.email() + ">");

                // Show the commit date.
                console.log("Date:\t" + commit.date());

                // Give some space and show the message.
                console.log("\n    " + commit.message());
            });

            // Start emitting events.
            history.start();
        });
}

module.exports = new chlog();