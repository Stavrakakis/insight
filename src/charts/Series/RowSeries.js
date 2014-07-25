/**
 * The RowSeries class extends the Series class and draws horizontal bars on a Chart
 * @class insight.RowSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.RowSeries = function RowSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var self = this,
        stacked = d3.functor(false),
        seriesName = '',
        seriesFunctions = {};

    this.valueAxis = y;
    this.keyAxis = x;
    this.classValues = [insight.Constants.BarClass];

    var tooltipFunction = function(d) {
        var func = self.currentSeries.accessor;
        return self.tooltipFormat()(func(d));
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.valueFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor(color),
        label: 'Value'
    }];


    /**
     * RowSeries overrides the standard key function used by most, vertical charts.
     * @memberof insight.RowSeries
     * @returns {object[]} return - The keys along the domain axis for this row series
     */
    this.keys = function() {
        return self.dataset()
            .map(self.keyFunction());
    };


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.RowSeries
     * @returns {Number} return - Description
     * @param {object} data - An item in the object array to query
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.accessor(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * This method returns the largest value on the value axis of this ColumnSeries, checking all series functions in the series on all points.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.RowSeries
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @memberof insight.RowSeries
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
     * @memberof insight.RowSeries
     * @returns {object} return - Description
     * @param {boolean} stack - To stack or not to stack
     */
    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateXPos = function(func, d) {
        if (!d.xPos) {
            d.xPos = 0;
        }
        var myPosition = d.xPos;

        d.xPos += func(d);

        return myPosition;
    };

    this.yPosition = function(d) {
        return self.y.scale(self.keyFunction()(d));
    };

    this.calculateYPos = function(thickness, d) {
        if (!d.yPos) {
            d.yPos = self.yPosition(d);
        } else {
            d.yPos += thickness;
        }
        return d.yPos;
    };

    this.xPosition = function(d) {

        var func = self.currentSeries.accessor;

        var position = self.stacked() ? self.x.scale(self.calculateXPos(func, d)) : 0;

        return position;
    };

    this.barThickness = function(d) {
        return self.y.scale.rangeBand(d);
    };

    this.groupedbarThickness = function(d) {

        var groupThickness = self.barThickness(d);

        var width = self.stacked() || (self.series.length == 1) ? groupThickness : groupThickness / self.series.length;

        return width;
    };

    this.offsetYPosition = function(d) {
        var thickness = self.groupedbarThickness(d);
        var position = self.stacked() ? self.yPosition(d) : self.calculateYPos(thickness, d);

        return position;
    };

    this.barWidth = function(d) {
        var func = self.currentSeries.accessor;

        return self.x.scale(func(d));
    };


    var mouseOver = function(data, i) {

        var seriesName = this.getAttribute('in_series');
        var seriesFunction = seriesFunctions[seriesName];

        self.mouseOver.call(this, data, i, seriesFunction);
    };

    /**
     * This function is required by the Series that currently support stacking.
     * it appends the stacked/grouped series name to the base class value returned by Series.itemClassName()
     * @memberof insight.RowSeries
     * @returns {string} itemClassValue - A value to use for this particular item and stacked/grouped series combination
     * @param {object} data - The data object being drawn
     */
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

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var data = this.dataset(),
            groupSelector = 'g.' + insight.Constants.BarGroupClass + '.' + this.name,
            groupClassName = insight.Constants.BarGroupClass + ' ' + this.name,
            barSelector = 'rect.' + insight.Constants.BarGroupClass;


        data.forEach(reset);


        var groups = chart.plotArea
            .selectAll(groupSelector)
            .data(data, this.keyAccessor);


        var newGroups = groups.enter()
            .append('g')
            .attr('class', groupClassName);

        var newBars = newGroups.selectAll(barSelector);

        var click = function(filter) {
            return self.click(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };

        for (var seriesIndex in this.series) {

            this.currentSeries = this.series[seriesIndex];

            seriesName = this.currentSeries.name;
            seriesFunctions[seriesName] = this.currentSeries.accessor;

            var seriesSelector = '.' + seriesName + 'class.' + insight.Constants.BarClass;

            newBars = newGroups.append('rect')
                .attr('class', self.seriesSpecificClassName)
                .attr('height', 0)
                .attr('fill', this.currentSeries.color)
                .attr('in_series', seriesName)
                .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                .on('mouseover', mouseOver)
                .on('mouseout', this.mouseOut)
                .on('click', click);

            var bars = groups.selectAll(seriesSelector)
                .transition()
                .duration(duration)
                .attr('y', this.offsetYPosition)
                .attr('x', this.xPosition)
                .attr('height', this.groupedbarThickness)
                .attr('width', this.barWidth);
        }

        groups.exit()
            .remove();
    };

    return this;
};


insight.RowSeries.prototype = Object.create(insight.Series.prototype);
insight.RowSeries.prototype.constructor = insight.RowSeries;
