var MetaRange = function (itemsInRange) {
    this.standardIntervalCount = 5;
    this.items = [];
    this.min = false;
    this.max = false;

    if (itemsInRange.length !== undefined) {
        this.items = itemsInRange;
        this.items.sort();
        this.min = this.items[0];
        this.max = this.items[this.items.length - 1];
    } else {
        this.min = itemsInRange.min;
        this.max = itemsInRange.max;
        this.interval = (itemsInRange.interval !== undefined) ? itemsInRange.interval : ((this.max - this.min) / this.standardIntervalCount);

        this.items = [];
        var currentVal = this.min;
        if (this.interval === 'doubling') {
            // Dividing by the square should give us about the right number of increments in the end
            if (currentVal === 0) {
                currentVal = this.max / (this.standardIntervalCount * this.standardIntervalCount);
            }

            // Doubling as we go
            do {
                this.items.push(currentVal);
                currentVal += currentVal;
            }
            while (currentVal <= this.max);
        } else {
            do {
                this.items.push(currentVal);
                currentVal += this.interval;
            } while (currentVal < this.max);
        }
    }
};

module.exports = MetaRange;
