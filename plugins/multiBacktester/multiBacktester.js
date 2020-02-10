const log = require('../../core/log');
const pipeline = require('../../core/pipeline');
const moment = require('moment');
const _ = require('lodash');
const util = require('../../core/util.js');
const config = util.getConfig();
const adviceLoggerConfig = config.adviceLogger;
const MetaRange = require("./metaRange");
const prompt = require('prompt-lite');
const program = require('commander');
const fs = require('fs');
const forker = require('child_process');

const numConcurrentConfigsToRun = 3;

var multiBacktester = {
    runTests: async function (config) {
        util.setGekkoMode('backtest');

        var rangesToTest = [];
        for (var configGroupKey in config.backtestRangeConfig) {
            var rangeGroup = config.backtestRangeConfig[configGroupKey];
            for (var configItemKey in rangeGroup) {
                rangesToTest.push({configGroupKey: configGroupKey, configItemKey: configItemKey, range: new MetaRange(rangeGroup[configItemKey])});
            }
        }

        var totalConfigurationCount = 1;
        var secondsPerRun = 30;
        rangesToTest.forEach(r => totalConfigurationCount = totalConfigurationCount * r.range.items.length);
        var start = new Date();

        log.warn("Running baseline config backtest for baseline");
        var originalConfigRun = forkAsPromised(`${__dirname}/../../gekko.js`, ['--backtest', '--config', 'config.js'], {silent: true});
        var result = await originalConfigRun;
        secondsPerRun = (new Date() - start) / 1000;
        prompt.start();

        var warning = rangesToTest.map(r => "\t\t" + r.configGroupKey + "." + r.configItemKey + " => [" + r.range.items.length + " items: " + r.range.items + "]");
        warning.unshift('\n\n\tRunning backtests over ' + totalConfigurationCount + ' configurations as follows: ');
        var totalProjectedTime = moment.duration(secondsPerRun * 1.5 * totalConfigurationCount, 'seconds');
        console.log(secondsPerRun + " seconds to run original config");
        warning.push('\n\n\tWARNING: Assuming between ' + secondsPerRun + ' and ' + secondsPerRun * 2 +
                     ' seconds per configuration run, this will take about ' + totalProjectedTime.humanize() + '\n');
        warning = warning.join('\n');
        log.warn(warning);

        prompt.get({name: 'confirmed'}, _.bind(function (something, results) {
            let userResponse = results.confirmed.toLowerCase();
            if (userResponse === 'y' || userResponse === 'yes' || userResponse === 'sure') {
                log.debug("Generating configuration permutations");
                var configsToTest = getPermutatedConfigRanges(rangesToTest);
                var runningPermutation = 1;
                var permutationGroup = 1;

                var finishedConfigs = [];
                while (configsToTest.length > 0 && permutationGroup < 4) {
                    var runningConfigs = [];
                    var start = new Date();
                    for (var i = 0; ((i < numConcurrentConfigsToRun) && (configsToTest.length > 0)); i++) {
                        let modifications = configsToTest.pop();
                        var configIteration = JSON.parse(JSON.stringify(config));
                        for (var modIndex = 0; modIndex < modifications.length; modIndex++) {
                            configIteration[modifications[modIndex].configGroupKey][modifications[modIndex].configItemKey] = modifications[modIndex].value;
                        }
                        log.debug('Running permutation #' + (runningPermutation++) +
                                  ' with values: ' + modifications.map(r => "\t" + r.configGroupKey + "." + r.configItemKey + ": " + r.value));

                        let configFilename = './multi-backtest-configs/config-g' + permutationGroup + 'i' + (runningPermutation) + '.js';
                        fs.writeFile(configFilename, JSON.stringify(configIteration), (err) => {if (err) {log.error(err);}});

                        var configRun = forkAsPromised(`${__dirname}/../../gekko.js`,
                                                       ['--backtest', '--config', configFilename],
                                                       {silent: true});
                        runningConfigs.push({modifications: modifications, config: configIteration, configFilename: configFilename, configRun: configRun});
                    }

                    console.log('awaiting group '+permutationGroup);
                    Promise.all(runningConfigs.map(cfg => cfg.configRun));
                    var secondsForGroup = new Date() - start;
                    console.log('and it took this many seconds '+secondsForGroup);

                    log.debug("------------------------ Loop #" + (permutationGroup++) + " --------------");
                }
            }
        }, this));
    }
};

function getPermutatedConfigRanges(rangesToTest) {
    var rangePermutations = [];

    // number of ranges
    var numRangesToTest = rangesToTest.length;

    // to keep track of next element in each of the ranges
    var workingIndices = Array(numRangesToTest).fill(0, 0, numRangesToTest);

    var loopCount = 0;
    while (true) {
        // save current combination
        // var logString = "Loop #" + (++loopCount) + ": ";
        var currentPermutation = [];
        for (var i = 0; i < numRangesToTest; i++) {
            currentPermutation.push(
                {
                    configGroupKey: rangesToTest[i].configGroupKey,
                    configItemKey: rangesToTest[i].configItemKey,
                    value: rangesToTest[i].range.items[workingIndices[i]]
                });
            // logString += (rangesToTest[i].range.items[workingIndices[i]] + " ");
        }
        rangePermutations.push(currentPermutation);
        // console.log(logString);

        // find the rightmost array that has more
        // elements left after the current element
        // in that array
        var next = numRangesToTest - 1;
        while (next >= 0 &&
               (workingIndices[next] + 1 >= rangesToTest[next].range.items.length)) {
            next--;
        }

        // no such array is found so no more
        // combinations left
        if (next < 0) {
            return rangePermutations;
        }

        // if found move to next element in that
        // array
        workingIndices[next]++;

        // for all arrays to the right of this
        // array current index again points to
        // first element
        for (var ii = next + 1; ii < numRangesToTest; ii++) {
            workingIndices[ii] = 0;
        }
    }
}

function forkAsPromised() {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
        var stdout = '', stderr = '';
        var childProcess = forker.fork.apply(null, args);
        childProcess.stdout.on('data', function (chunk) {
            stdout += chunk;
            // console.log("PROCESS: " + stdout);
        });
        childProcess.stderr.on('data', function (chunk) {
            stderr += chunk;
            // console.log("ERR: " + chunk);
        });
        childProcess.on('error', reject)
                    .on('close', function (code) {
                        if (code === 0) {
                            resolve(stdout);
                        } else {
                            reject(stderr);
                        }
                    });
    });
}

module.exports = multiBacktester;
