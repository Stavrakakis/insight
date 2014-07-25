/**
 * The Axis class coordinates the domain of the series data and draws axes.
 * @class insight.Axis
 * @param {string} name - A uniquely identifying name for this chart
 * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
 */
insight.Axis = function Axis(name, scale) {

    this.scaleType = scale.name;
    this.scale = scale.scale();
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.bounds = [0, 0];
    this.series = [];
    this.direction = '';
    this.gridlines = new insight.AxisGridlines(this);

    var self = this,
        label = name,
        ordered = d3.functor(false),
        orderingFunction = null,
        tickSize = d3.functor(1),
        tickPadding = d3.functor(10),
        labelRotation = '0',
        tickOrientation = d3.functor('lr'),
        showGridLines = false,
        colorFunction = d3.functor('#777'),
        display = true,
        barPadding = d3.functor(0.1),
        initialisedAxisView = false,
        reversedPosition = false,
        zoomable = false;

    var orientation = function() {
        if (self.horizontal()) {
            return (reversedPosition) ? 'top' : 'bottom';
        } else {
            return (reversedPosition) ? 'right' : 'left';
        }
    };

    var textAnchor = function() {
        var orientation = self.orientation();
        if (orientation == 'left' || orientation == 'top') {
            return 'end';
        } else {
            return 'start';
        }
    };

    // private functions

    /**
     * The default axis tick format, just returns the input
     * @returns {object} tickPoint - The axis data for a particular tick
     * @param {object} ticklabel - The output string to be displayed
     */
    var format = function(d) {
        return d;
    };

    /**
     * This method calculates the scale ranges for this axis, given a range type function and using the calculated output bounds for this axis.
     * @param {rangeType} rangeType - a d3 range function, which can either be in bands (for columns) or a continuous range
     */
    var applyScaleRange = function(rangeType) {

        // x-axis goes from 0 (left) to max (right)
        // y-axis goes from max (top) to 0 (bottom)
        var rangeBounds = (self.horizontal()) ? [0, self.bounds[0]] : [self.bounds[1], 0];

        rangeType.apply(this, [
            rangeBounds, self.barPadding()
        ]);
    };

    this.barPadding = function(_) {
        if (!arguments.length) {
            return barPadding();
        }
        barPadding = d3.functor(_);
        return this;
    };

    /**
     * For an ordinal/categorical axis, this method queries all series that use this axis to get the list of available values
     * @memberof insight.Axis
     * @returns {object[]} values - the values for this ordinal axis
     */
    var findOrdinalValues = function() {
        var vals = [];

        self.series.map(function(series) {
            vals = vals.concat(series.keys());
        });

        vals = insight.Utils.arrayUnique(vals);

        return vals;
    };

    /**
     * For linear series, this method is used to calculate the maximum value to be used in this axis.
     * @memberof insight.Axis
     * @returns {Date} max - The largest value in the datasets that use this axis
     */
    var findMax = function() {
        var max = 0;

        self.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };


    /**
     * For time series, this method is used to calculate the minimum value to be used in this axis.
     * @memberof insight.Axis
     * @returns {Date} minTime - The smallest time in the datasets that use this axis
     */
    var minTime = function() {
        // start at the largest time, and work back from there to find the minimum
        var minTime = new Date(8640000000000000);

        self.series.map(function(series) {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    /**
     * For time series, this method is used to calculate the maximum value to be used in this axis.
     * @returns {Date} minTime - The largest time in the datasets that use this axis
     */
    var maxTime = function() {
        // start at the smallest time, and work back from there to find the minimum
        var maxTime = new Date(-8640000000000000);

        self.series.map(function(series) {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };


    // public functions 


    this.horizontal = function() {
        return this.direction == 'h';
    };

    this.vertical = function() {
        return this.direction == 'v';
    };

    this.ordered = function(value) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(value);
        return this;
    };

    this.orderingFunction = function(value) {
        if (!arguments.length) {
            return orderingFunction();
        }
        orderingFunction = value;
        return this;
    };


    this.addSeries = function(series) {
        this.series.push(series);
    };


    // scale domain and output range methods


    /**
     * This method calculates the domain of values that this axis has, from a minimum to a maximum.
     * @memberof insight.Axis
     * @returns {object[]} bounds - An array with two items, for the lower and upper range of this axis
     */
    this.domain = function() {
        var domain = [];

        if (this.scaleType == insight.Scales.Linear.name) {
            domain = [0, findMax()];
        } else if (this.scaleType == insight.Scales.Ordinal.name) {
            domain = findOrdinalValues();
        } else if (this.scaleType == insight.Scales.Time.name) {
            domain = [minTime(), maxTime()];
        }

        return domain;
    };


    /**
     * This method calculates the output range bound of this axis, taking into account the size and margins of the chart.
     * @memberof insight.Axis
     * @returns {int[]} bounds - An array with two items, for the width and height of the axis, respectively.
     */
    this.calculateAxisBounds = function(chart) {
        var bounds = [];
        var margin = chart.margin();

        bounds[0] = chart.width() - margin.right - margin.left;
        bounds[1] = chart.height() - margin.top - margin.bottom;

        self.bounds = bounds;

        return self.bounds;
    };


    /**
     * This getter/setter defines whether or not the axis is initialized with zoom functionality by a chart
     * @memberof insight.Axis
     * @returns {boolean}
     */
    /**
     * @memberof insight.Axis
     * @param {boolean} value - When used as a setter, this function takes a boolean value that will define whether this axis is zoomable
     * @returns {this}
     */
    this.zoomable = function(value) {
        if (!arguments.length) {
            return zoomable;
        }
        zoomable = value;

        return this;
    };

    /**
     * This getter/setter defines whether or not the axis should be drawn on the chart (lines and labels)
     * @memberof insight.Axis
     * @returns {function}
     */
    /**
     * @memberof insight.Axis
     * @param {boolean} value - When used as a setter, this function takes a boolean value that will define whether this axis will be drawn
     * @returns {this}
     */
    this.display = function(value) {
        if (!arguments.length) {
            return display;
        }
        display = value;
        return this;
    };

    this.reversed = function(value) {
        if (!arguments.length) {
            return reversedPosition;
        }
        reversedPosition = value;
        return this;
    };

    // label and axis tick methods

    this.label = function(value) {
        if (!arguments.length) {
            return label;
        }
        label = value;
        return this;
    };


    this.labelFormat = function(value) {
        if (!arguments.length) {
            return format;
        }
        format = value;
        return this;
    };

    /**
     * This getter/setter defines the color used by the axis labels and lines
     * @memberof insight.Axis
     * @returns {function}
     */
    /**
     * @memberof insight.Axis
     * @param {object} color - When used as a setter, this function can take a string color (hex, named or "rgb(r,g,b)") or a function that returns the color of the axis.
     * @returns {this}
     */
    this.color = function(color) {
        if (!arguments.length) {
            return colorFunction;
        }
        colorFunction = d3.functor(color);
        return this;
    };


    this.orientation = function(value) {
        if (!arguments.length) {
            return orientation();
        }
        orientation = d3.functor(value);
        return this;
    };


    this.tickRotation = function(value) {
        if (!arguments.length) {
            return labelRotation;
        }
        labelRotation = value;
        return this;
    };



    this.tickSize = function(value) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(value);
        return this;
    };


    this.tickPadding = function(value) {
        if (!arguments.length) {
            return tickPadding();
        }
        tickPadding = d3.functor(value);
        return this;
    };


    this.textAnchor = function(value) {
        if (!arguments.length) {
            return textAnchor();
        }
        textAnchor = d3.functor(value);
        return this;
    };



    this.tickOrientation = function(value) {
        if (!arguments.length) {
            return tickOrientation();
        }

        if (value === 'tb') {
            labelRotation = '90';
        } else if (value === 'lr') {
            labelRotation = '0';
        }

        tickOrientation = d3.functor(value);

        return this;
    };


    /**
     * This method gets/sets the rotation angle used for horizontal axis labels.  Defaults to 90 degrees
     * @memberof insight.Axis
     * @returns {object} return - Description
     * @param {object[]} data - Description
     */
    this.tickRotationTransform = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);
        offset = (reversedPosition && self.vertical()) ? 0 - offset : offset;

        var rotation = ' rotate(' + self.tickRotation() + ',0,' + offset + ')';

        return rotation;
    };


    this.axisPosition = function() {
        var transform = 'translate(';

        if (self.horizontal()) {
            var transX = 0;
            var transY = self.orientation() == 'top' ? 0 : self.bounds[1];

            transform += transX + ',' + transY + ')';

        } else if (self.vertical()) {
            var xShift = self.orientation() == 'left' ? 0 : self.bounds[0];
            transform += xShift + ',0)';
        }

        return transform;
    };

    this.pixelValueForValue = function(d) {
        return self.scale(d);
    };

    /**
     * This method positions the text label for the axis (not the tick labels)
     * @memberof insight.Axis
     */
    this.positionLabel = function() {

        if (self.horizontal()) {
            this.labelElement.style('left', 0)
                .style(self.orientation(), 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else if (self.vertical()) {
            this.labelElement.style(self.orientation(), '0')
                .style('top', '35%');
        }
    };

    /**
     * This getter/setter defines whether gridlines are displayed for the axis.
     * @memberof insight.Axis
     * @returns {function}
     */
    /**
     * @memberof insight.Axis
     * @param {object} showLines - When used as a setter, this function can take a boolean of whether to display the gridlines (true) or hide them (false).
     * @returns {this}
     */
    this.showGridlines = function(showLines) {
        if (!arguments.length) {
            return showGridLines;
        }
        showGridLines = showLines;

        return this;
    };

    this.initializeScale = function() {
        applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);

    };


    this.setupAxisView = function(chart) {

        if (initialisedAxisView)
            return;

        this.initializeScale();

        initialisedAxisView = true;

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement = chart.plotArea.append('g');

        this.axisElement
            .attr('class', insight.Constants.AxisClass)
            .attr('transform', self.axisPosition())
            .call(this.axis)
            .selectAll('text')
            .attr('class', insight.Constants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotationTransform());

        this.labelElement = chart.container
            .append('div')
            .attr('class', insight.Constants.AxisLabelClass)
            .style('position', 'absolute')
            .text(this.label());
    };



    this.draw = function(chart, dragging) {

        // Scale range and bounds need to be initialized regardless of whether the axis will be displayed

        this.calculateAxisBounds(chart);

        if (!this.zoomable()) {
            this.initializeScale();
        }

        if (!this.display()) {
            return;
        }

        this.setupAxisView(chart);

        var animationDuration = dragging ? 0 : 200;

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement
            .attr('transform', self.axisPosition())
            .style('stroke', self.color())
            .transition()
            .duration(animationDuration)
            .call(this.axis);

        this.axisElement
            .selectAll('text')
            .attr('transform', self.tickRotationTransform())
            .style('text-anchor', self.textAnchor());

        this.labelElement
            .text(this.label());

        this.positionLabel();


        if (showGridLines) {
            this.gridlines.drawGridLines(chart, this.scale.ticks());
        }
    };
};
