'use strict';
var path = require('path');
var request = require('request');
var fs = require('fs');
let childProcess = require('child_process');
var packageJson = require('../package.json');
var configFileNames = require('../scripts/configFileNames.json');
var config = require('../'+configFileNames.config);
var git = require('git-utils');
// Private fields
var __private = {};


function Script () {
}

Script.prototype.triggerPortChangeScript = function (height) {
  if(height == '260000') {
    var sys  = require('util'),
        exec = require('child_process').exec,
        child;
      child = exec('sh scripts/portChange.sh', function (error, stdout, stderr)
      {
          if (error)
             console.log('There was an error executing the script');
          console.log('Sucessfully executed the script!!!');
      });
  }
};

Script.prototype.getLatestBplNodeVersion = function (height) {
  // APPROACH 2
  var options = {
    url: 'https://test.bit.blockpool.io/insecure/utilities/delegatenodeversion',
    method: 'GET',
    headers: {'user-agent': 'node.js'}
    };
      request(options, function (err, res) {
        let response = JSON.parse(res.body);
        if(!err)
          {
            let spawn = childProcess.spawn;
            let gitReleaseVersion = response.result.nodeVersion.split(".");
            let gitReleaseBranch = response.result.branch;
            let packageJsonVersion =  packageJson.version.split(".");
            var repository = git.open(__dirname);
            var gitBranch=repository.getHead();
            gitBranch=path.basename(gitBranch);
             if(gitReleaseVersion[0] > packageJsonVersion[0] || gitReleaseVersion[1] > packageJsonVersion[1] && gitBranch == gitReleaseBranch )
               {
                 spawn('bash',['scripts/getUpdatesFromGit.sh', '1', configFileNames.config, configFileNames.genesis, config.port]);
               }
             else
              {
                if(gitReleaseVersion[2] > packageJsonVersion[2] && gitBranch == gitReleaseBranch)
                {
                  spawn('bash',['scripts/getUpdatesFromGit.sh', '0', configFileNames.config, configFileNames.genesis, config.port]);
                }
              }
           }
        else {
          //oput logger logs
           console.log("There was an error while getting latest updates from GiT.");
        }
      });
};
// Export
module.exports = Script;
