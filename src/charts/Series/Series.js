/**
 * The Series base class provides some base functions that are used by any specific types of series that derive from this class
 * @class insight.Series
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.Series = function Series(name, data, x, y, color) {

    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;
    this.topValues = null;
    this.classValues = [];
    this.valueAxis = x;
    this.keyAxis = y;
    this.selectedItems = [];

    x.addSeries(this);
    y.addSeries(this);

    var self = this,
        filter = null,
        tooltipOffset = {
            x: 0,
            y: -10
        };

    // private functions used internally, set by functions below that are exposed on the object

    var keyFunction = function(d) {
        return d.key;
    };

    var valueFunction = function(d) {
        return d.value;
    };

    // default x and y to vertical.  Series can override this if needed in their constructors.
    var xFunction = function(d) {
        return d.x;
    };

    var yFunction = function(d) {
        return d.y;
    };

    var tooltipFormat = function(d) {
        return d;
    };

    var tooltipAccessor = function(d) {
        return valueFunction(d);
    };

    var tooltipFunction = function(d) {
        return tooltipFormat(tooltipAccessor(d));
    };

    /*
     * This function is used when individual chart items are being drawn, to check whether they should be marked as selected or not.
     * @memberof insight.Series
     * @returns {string} selectionClass - A string that is used by CSS highlighting to style the chart item.
     * @param {string[]}selectedItems - A list of CSS selectors for currently selected items
     * @param {string} selector - The selector for the item being drawn
     */
    var selectedClassName = function(selectedItems, selector) {
        var selected = '';

        if (selectedItems.length) {
            selected = selectedItems.indexOf(selector) != -1 ? ' selected' : ' notselected';
        }

        return selected;
    };


    /*
     * This function generates the base class name to be used for items in this series.It can be extended upon by individual items to show
     * if they are selected or to mark them out in other ways.
     * @memberof insight.Series
     * @returns {string} baseClassName - A root valuefor the class attribute used for items in this Series.
     */
    this.seriesClassName = function() {

        var seriesName = [self.name + 'class'].concat(self.classValues)
            .join(' ');

        return seriesName;
    };


    /*
     * This function constructs the text for the class attribute for a specific data point, using the base value for this Series and any additional values.
     * @memberof insight.Series
     * @param {object} dataItem - The data item being drawn
     * @param {string[]} additionalClasses - Any additional values this Series needs appending to the class value.Used by stacked Series to differentiate between Series.
     * @returns {string} classValue - A class value for a particular data item being bound in this Series.
     */
    this.itemClassName = function(dataItem, additionalClasses) {

        var keySelector = insight.Utils.keySelector(dataItem, keyFunction);
        var selected = selectedClassName(self.selectedItems, keySelector);
        var value = self.rootClassName + ' ' + keySelector + selected;

        return value;
    };


    // Public methods

    /**
     * The function used to retrieve the x-value from the data object to plot on a chart.
     * @memberof! insight.Series
     * @instance
     * @returns {function} The current function used to extract the x-value.
     *
     * @also
     *
     * Sets the function used to retrieve the x-value from the data object to plot on a chart.
     * @memberof! insight.Series
     * @instance
     * @param {function} keyFunc The new key function to use to extract the x-value from a data object.
     * @returns {this}
     */
    this.keyFunction = function(keyFunc) {
        if (!arguments.length) {
            return keyFunction;
        }
        keyFunction = keyFunc;

        return this;
    };

    /**
     * The function used to retrieve the y-value from the data object to plot on a chart.
     * @memberof! insight.Series
     * @instance
     * @returns {function} The current function used to extract the y-value.
     *
     * @also
     *
     * Sets the function used to retrieve the y-value from the data object to plot on a chart.
     * @memberof! insight.Series
     * @instance
     * @param {function} valueFunc The new key function to use to extract the y-value from a data object.
     * @returns {this}
     */
    this.valueFunction = function(valueFunc) {
        if (!arguments.length) {
            return valueFunction;
        }
        valueFunction = valueFunc;

        return this;
    };

    /**
     * This method returns the array of data objects used to plot this Series.
     * @memberof! insight.Series
     * @instance
     * @returns {object[]} - The data set to be used by the series
     */
    this.dataset = function(orderFunction) {

        // If the valueAxis is ordered but no function has been provided, create one based on the Series' valueFunction
        if (this.valueAxis.ordered() && !orderFunction) {

            orderFunction = function(a, b) {
                return self.valueFunction()(b) - self.valueFunction()(a);
            };
        }

        var data = this.data.getData(orderFunction, this.topValues);

        if (filter) {
            data = data.filter(filter);
        }

        return data;
    };

    this.keys = function(orderFunction) {
        return this.dataset(orderFunction)
            .map(self.keyFunction());
    };


    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;
    };

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }
        yFunction = _;

        return this;

    };

    /**
     * The distance to which move the tooltip for this series relative to its default point.
     * @memberof! insight.Series
     * @instance
     * @returns {object} - The {x,y} offset to place the tooltip from the point.
     *
     * @also
     *
     * Sets the distance to which move the tooltip for this series relative to its default point.
     * @memberof! insight.Series
     * @instance
     * @param {object} offset The new distance to which move the tooltip for this series relative to its default point.
     * @returns {this}
     */
    this.tooltipOffset = function(value) {
        if (!arguments.length) {
            return tooltipOffset;
        }
        tooltipOffset = value;

        return this;
    };

    /*
     * This method creates the tooltip for this Series, checking if it exists already first.
     * @memberof insight.Series
     * @param {DOMElement} container - The DOM Element that the tooltip should be drawn inside.
     */
    this.initializeTooltip = function(container) {
        if (!this.tooltip) {
            this.tooltip = new insight.Tooltip()
                .container(container)
                .offset(self.tooltipOffset());
        }
    };

    /*
     * This event handler is triggered when a series element (rectangle, circle or line) triggers a mouse over. Tooltips are shown and CSS updated.
     * The *this* context will reference the DOMElement raising the event.
     * @memberof insight.Series
     * @param {object} item - The data point for the hovered item.
     * @param {int} index - The index of the hovered item in the data set.  This is required at the moment as we need to provide the valueFunction until stacked series are refactored.
     * @param {function} valueFunction - If provided, this function will be used to generate the tooltip text, otherwise the series default valueFunction will be used.
     *                                   This is only for stacked charts that currently have multiple valueFunctions.
     */
    this.mouseOver = function(item, i, valueFunction) {

        var textFunction = valueFunction ? valueFunction : self.tooltipFunction();
        var tooltipText = textFunction(item);

        self.tooltip.show(this, tooltipText);

        d3.select(this)
            .classed('active', true);
    };

    /*
     * This event handler is triggered when a series element (rectangle, circle or line) triggers a mouseout event. Tooltips are hidden and CSS updated.
     * The *this* context will reference the DOMElement raising the event.
     * @memberof insight.Series
     */
    this.mouseOut = function() {

        self.tooltip.hide();

        d3.select(this)
            .classed('active', false);
    };



    this.click = function(element, filter) {

        var selector = insight.Utils.keySelector(filter, keyFunction);

        this.clickEvent(this, filter, selector);
    };

    this.filterFunction = function(_) {
        if (!arguments.length) {
            return filter;
        }
        filter = _;

        return this;
    };

    this.tooltipFormat = function(_) {
        if (!arguments.length) {
            return tooltipFormat;
        }
        tooltipFormat = _;

        return this;
    };

    this.tooltipFunction = function(_) {
        if (!arguments.length) {
            return tooltipFunction;
        }
        tooltipFunction = _;

        return this;
    };

    this.top = function(_) {
        if (!arguments.length) {
            return this.topValues;
        }
        this.topValues = _;

        return this;
    };

    this.maxLabelDimensions = function(measureCanvas) {

        var sampleText = document.createElement('text');
        sampleText.setAttribute('class', insight.Constants.AxisTextClass);
        var style = window.getComputedStyle(sampleText);
        var ctx = measureCanvas.getContext('2d');
        ctx.font = style['font-size'] + ' ' + style['font-family'];

        var fontSize = 0;

        var maxValueWidth = 0;
        var maxKeyWidth = 0;

        var data = this.dataset();

        this.keys()
            .forEach(function(key) {
                var value = insight.Utils.valueForKey(data, key, keyFunction, valueFunction);

                var keyFormat = self.x.labelFormat();
                var valueFormat = self.y.labelFormat();

                var keyString = keyFormat(key);
                var valueString = valueFormat(value);

                var keyDimensions = ctx.measureText(keyString);
                var valueDimensions = ctx.measureText(valueString);

                maxKeyWidth = Math.max(keyDimensions.width, maxKeyWidth);
                maxValueWidth = Math.max(valueDimensions.width, maxValueWidth);
                fontSize = Math.ceil(style['font-size']) || 10;
            });

        var maxDimensions = {
            "maxKeyWidth": maxKeyWidth,
            "maxKeyHeight": fontSize,
            "maxValueWidth": maxValueWidth,
            "maxValueHeight": fontSize
        };

        //Handle tick rotation
        if (x.tickRotation() !== '0') {
            //Convert Degrees -> Radians
            var xSin = Math.sin(x.tickRotation() * Math.PI / 180);
            var xCos = Math.cos(x.tickRotation() * Math.PI / 180);

            maxDimensions.maxKeyWidth = Math.ceil(Math.max(fontSize * xSin, maxKeyWidth * xCos));
            maxDimensions.maxKeyHeight = Math.ceil(Math.max(fontSize * xCos, maxKeyWidth * xSin));
        }

        if (y.tickRotation() !== '0') {
            //Convert Degrees -> Radians
            var ySin = Math.sin(y.tickRotation() * Math.PI / 180);
            var yCos = Math.cos(y.tickRotation() * Math.PI / 180);

            maxDimensions.maxValueWidth = Math.ceil(Math.max(fontSize * ySin, maxValueWidth * yCos));
            maxDimensions.maxValueHeight = Math.ceil(Math.max(fontSize * yCos, maxValueWidth * ySin));
        }

        return maxDimensions;
    };

    /**
     * Extracts the minimum value on an axis for this series.
     * @memberof! insight.Series
     * @instance
     * @param scale The corresponding x or y axis
     * @returns {Number} - The minimum value within the range of the values for this series on the given axis.
     */
    this.findMin = function(scale) {
        var self = this;

        var data = this.dataset();

        var func = scale == self.x ? self.keyFunction() : self.valueFunction();

        return d3.min(data, func);
    };

    /**
     * Extracts the maximum value on an axis for this series.
     * @memberof! insight.Series
     * @instance
     * @param scale The corresponding x or y axis
     * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
     */
    this.findMax = function(scale) {
        var self = this;

        var data = this.dataset();

        var func = scale == self.x ? self.keyFunction() : self.valueFunction();

        return d3.max(data, func);
    };

    this.draw = function(chart, drag) {};

    return this;
};

/* Skeleton event overriden by a Dashboard to subscribe to this series' clicks.
 * @param {object} series - The series being clicked
 * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
 * @param {object[]} selection - The css selection name also used to maintain a list of filtered dimensions (TODO - is this needed anymore?)
 */
insight.Series.prototype.clickEvent = function(series, filter, selection) {

};
