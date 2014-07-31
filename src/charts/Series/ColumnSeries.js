/**
 * The ColumnSeries class extends the Series class and draws vertical bars on a Chart
 * @class insight.ColumnSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.ColumnSeries = function ColumnSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var self = this,
        stacked = d3.functor(false),
        seriesName = '',
        seriesFunctions = {},
        barWidthFunction = this.x.rangeType;

    this.classValues = [insight.Constants.BarClass];

    this.series = [{
        name: 'default',
        valueFunction: function(d) {
            return self.valueFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor(color),
        label: 'Value'
    }];


    var tooltipFunction = function(d) {
        var func = self.currentSeries.valueFunction;
        return self.tooltipFormat()(func(d));
    };

    /*
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.ColumnSeries
     * @param {object} data An item in the object array to query
     * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.valueFunction(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * Extracts the maximum value on an axis for this series.
     * @memberof! insight.ColumnSeries
     * @instance
     * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * Determines whether the series should stack columns, or line them up side-by-side.
     * @memberof! insight.ColumnSeries
     * @instance
     * @returns {boolean} - To stack or not to stack.
     *
     * @also
     *
     * Sets whether the series should stack columns, or line them up side-by-side.
     * @memberof! insight.ColumnSeries
     * @instance
     * @param {boolean} stacked Whether the column series should be stacked.
     * @returns {this}
     */
    this.stacked = function(stack) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(stack);
        return this;
    };

    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.xPosition = function(d) {
        return self.x.scale(self.keyFunction()(d));
    };

    this.calculateXPos = function(width, d) {
        if (!d.xPos) {
            d.xPos = self.xPosition(d);
        } else {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d) {

        var func = self.currentSeries.valueFunction;

        var position = self.stackedBars() ? self.y.scale(self.calculateYPos(func, d)) : self.y.scale(func(d));

        return position;
    };



    this.barWidth = function(d) {
        // comment for tom, this is the bit that is currently breaking the linear x axis, because d3 linear scales don't support the rangeBand() function, whereas ordinal ones do.
        // in js, you can separate the scale and range function using rangeBandFunction.call(self.x.scale, d), where rangeBandFunction can point to the appropriate function for the type of scale being used.
        return self.x.scale.rangeBand(d);
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupWidth : groupWidth / self.series.length;

        return width;
    };

    this.offsetXPosition = function(d) {
        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.stackedBars = function() {
        return self.stacked();
    };

    var click = function(filter) {
        return self.click(this, filter);
    };

    var duration = function(d, i) {
        return 200 + (i * 20);
    };

    var mouseOver = function(data, i) {
        var seriesName = this.getAttribute('in_series');
        var seriesFunction = seriesFunctions[seriesName];

        self.mouseOver.call(this, data, i, seriesFunction);
    };


    this.seriesSpecificClassName = function(d) {

        var additionalClass = ' ' + self.currentSeries.name + 'class';
        var baseClassName = self.itemClassName(d);
        var itemClassName = baseClassName + additionalClass;

        return itemClassName;
    };

    this.draw = function(chart, drag) {

        self.initializeTooltip(chart.container.node());
        self.selectedItems = chart.selectedItems;
        self.rootClassName = self.seriesClassName();

        var groupSelector = 'g.' + insight.Constants.BarGroupClass,
            barSelector = 'rect.' + insight.Constants.BarGroupClass;

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var data = self.dataset();

        data.forEach(reset);

        var groups = chart.plotArea
            .selectAll(groupSelector)
            .data(data, self.keyFunction());

        var newGroups = groups.enter()
            .append('g')
            .attr('class', insight.Constants.BarGroupClass);

        var newBars = newGroups.selectAll(barSelector);

        var barHeight = function(d) {
            var func = self.currentSeries.valueFunction;

            return (chart.height() - chart.margin()
                .top - chart.margin()
                .bottom) - self.y.scale(func(d));
        };

        for (var seriesIndex in self.series) {

            self.currentSeries = self.series[seriesIndex];

            seriesName = self.currentSeries.name;
            seriesFunctions[seriesName] = self.currentSeries.valueFunction;

            var seriesSelector = '.' + seriesName + 'class.' + insight.Constants.BarClass;

            // Add any new bars

            newBars = newGroups.append('rect')
                .attr('class', self.seriesSpecificClassName)
                .attr('y', self.y.bounds[0])
                .attr('height', 0)
                .attr('in_series', seriesName)
                .attr('fill', self.currentSeries.color)
                .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                .on('mouseover', mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', click);

            // Select and update all bars
            var bars = groups.selectAll(seriesSelector);

            bars
                .transition()
                .duration(duration)
                .attr('y', self.yPosition)
                .attr('x', self.offsetXPosition)
                .attr('width', self.groupedBarWidth)
                .attr('height', barHeight);
        }

        // Remove groups no longer in the data set
        groups.exit()
            .remove();
    };

    return this;
};

insight.ColumnSeries.prototype = Object.create(insight.Series.prototype);
insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;
