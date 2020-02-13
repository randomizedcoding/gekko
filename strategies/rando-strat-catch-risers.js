// Let's create our own strategy
var _ = require('lodash');
var Moment = require('moment');
var log = require('../core/log.js');

/**
 * Strategy
 *
 * @type {{fastRisePercentage: number, previousCandles: [], fastRisingCandlesToTriggerRise: number, fallPercentage: number, neutralOrRisingCandlesToTriggerRise: number, risePercentage: number, advice: string}}
 */
let catchRisersStrategy = {
    fallPercentage: 0.005,
    risePercentage: 0.01,
    fastRisePercentage: 0.03,
    previousCandles: [],
    previousTrends: [],
    neutralOrRisingCandlesToTriggerRise: 30,
    fastRisingCandlesToTriggerRise: 3
};

/**
 * @typedef {Object} Candle
 * @property {number}  volume
 * @property {number}  high
 * @property {number}  low
 * @property {Object}  start
 * @property {number}  trades
 * @property {number}  close
 * @property {number}  open
 * @property {number}  vwp
 */

/**
 * AdviceProperties
 * @type {{trigger: {type: string, trailPercentage: number}, direction: string}}
 */

const updateCount = 0;

// Prepare everything our strat needs
catchRisersStrategy.init = function () {
    log.debug("Starting up the trading bot!");
    this.fallPercentage = this.settings.fallPercentage;
    this.risePercentage = this.settings.risePercentage;
    this.fastRisePercentage = this.settings.fastRisePercentage;
    this.neutralOrRisingCandlesToTriggerRise = this.settings.neutralOrRisingCandlesToTriggerRise;
    this.fastRisingCandlesToTriggerRise = this.settings.fastRisingCandlesToTriggerRise;

    this.requiredHistory = Math.max(this.neutralOrRisingCandlesToTriggerRise, this.fastRisingCandlesToTriggerRise);

    log.debug("Initialization: fallPercentage: " + this.fallPercentage);
    log.debug("Initialization: risePercentage: " + this.risePercentage);
    log.debug("Initialization: fastRisePercentage: " + this.fastRisePercentage);
    log.debug("Initialization: previousCandles: " + this.previousCandles);
    log.debug("Initialization: previousTrends: " + this.previousTrends);
    log.debug("Initialization: neutralOrRisingCandlesToTriggerRise: " + this.neutralOrRisingCandlesToTriggerRise);
    log.debug("Initialization: fastRisingCandlesToTriggerRise: " + this.fastRisingCandlesToTriggerRise);
};

/**
 * Happens every candle.
 *
 * @param candle {Candle} The candle that just came through
 */
catchRisersStrategy.update = function (candle) {
    // If we're above our limit, let's start throwing away the old ones
    if (this.previousCandles.length > this.requiredHistory) {
        this.previousCandles.shift();
        this.previousTrends.shift();
    }

    // We want at least our limit + 1
    this.previousCandles.push(candle);

    // Check the trend
    if (this.previousCandles.length > 1) {
        let prevPrice = this.previousCandles[this.previousCandles.length - 2].vwp;
        let currentPrice = candle.vwp;
        let trend = {
            fastRise: currentPrice >= (prevPrice * (1 + this.fastRisePercentage)),
            slowRise: currentPrice >= (prevPrice * (1 + this.risePercentage)),
            falling: currentPrice <= (prevPrice * (1 - this.fallPercentage))
        };
        trend.flatLine = !trend.fastRise && !trend.falling && !trend.slowRise;
        trend.difference = ((currentPrice < prevPrice) ? -1 : 1) *
                           Number.parseFloat((100 * Math.abs((prevPrice - currentPrice) / ((prevPrice + currentPrice) / 2))).toFixed(3));

        this.previousTrends.push(trend);
    }
};

/**
 * Log some things?
 */
catchRisersStrategy.log = function () {};

/**
 * Checks what we should do at this moment (if anything)
 * @param candle {Candle} The candle from the last update
 */
catchRisersStrategy.check = function (candle) {
    /*
     IF LAST [3] CANDLES RISING OR NEUTRAL, OR LAST CANDLE FAST RISING
     - BUY
     IF LAST CANDLE FALLING, OR LAST [2] CANDLES NEUTRAL
     - SELL
     */

    let mostRecentTrend = this.previousTrends[this.previousTrends.length - 1];
    if(!mostRecentTrend){
        log.error("Most recent trend not found");
        log.error(mostRecentTrend);
        return;
    }

    if (mostRecentTrend.fastRise) {
        // Last candle was a fast rise
        log.debug("Fast Rise: [last candle => this candle] - [" +
                  this.previousCandles[this.previousCandles.length - 2].vwp + " => " + candle.vwp + "], " +
                  mostRecentTrend.difference + "%");
        this.advice('long');
    } else if (this.previousTrends.every(trend => trend.slowRise)) {
        // } else if (this.previousTrends.every(trend => trend.slowRise || trend.flatLine)) {
        // Trending slowly upwards
        var msg = "Slow Rise: [last candle => ... => this candle] - [";
        // var msg = "Slow Rise or Flatline: [last candle => ... => this candle] - [";
        this.previousCandles.forEach(candle => msg += candle.vwp + " => ");
        log.debug(msg.slice(0, msg.length - 4) + "], " +
                  mostRecentTrend.difference + "%");
        this.advice('long');
    } else if (mostRecentTrend.falling) {
        // Falling
        log.debug("Falling : [last candle => this candle] - [" + this.previousCandles[this.previousCandles.length - 2].vwp + " => " + candle.vwp + "], " +
                  mostRecentTrend.difference + "%");
        this.advice('short');
    }
};

// Optional for executing code
// after completion of a backtest.
// This block will not execute in
// live use as a live gekko is
// never ending.
catchRisersStrategy.end = function () {
    log.debug("We're done here.");
};

module.exports = catchRisersStrategy;
