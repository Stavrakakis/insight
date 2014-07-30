/**
 * The ScatterSeries class extends the Series class
 * @class insight.ScatterSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.ScatterSeries = function ScatterSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var radiusFunction = d3.functor(3),
        opacityFunction = d3.functor(1),
        self = this,
        selector = this.name + insight.Constants.Scatter;


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };


    this.rangeY = function(d) {
        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        return self.x.scale(self.xFunction()(d));
    };

    this.radiusFunction = function(_) {
        if (!arguments.length) {
            return radiusFunction;
        }
        radiusFunction = _;

        return this;
    };

    this.pointRadius = function(_) {
        if (!arguments.length) {
            return radiusFunction();
        }
        radiusFunction = d3.functor(_);

        return this;
    };

    this.pointOpacity = function(_) {
        if (!arguments.length) {
            return opacityFunction();
        }
        opacityFunction = d3.functor(_);

        return this;
    };

    var className = function(d) {

        return selector + " " + insight.Constants.Scatter + " " + self.dimensionName;
    };

    this.fillFunction = function(_) {
        if (!arguments.length) {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };

    this.scatterData = function(data) {
        var max = d3.max(data, radiusFunction);

        //Minimum of pixels-per-axis-unit
        var xValues = data.map(self.xFunction());
        var yValues = data.map(self.yFunction());
        var xBounds = this.x.bounds[1];
        var yBounds = this.y.bounds[0];

        // create radius for each item
        data.forEach(function(d) {
            d.radius = radiusFunction(d);
        });

        return data;
    };

    this.draw = function(chart, drag) {

        self.initializeTooltip(chart.container.node());
        self.selectedItems = chart.selectedItems;

        var duration = drag ? 0 : function(d, i) {
            return 200 + (i * 20);
        };

        var click = function(filter) {
            return self.click(this, filter);
        };

        var scatterData = this.scatterData(this.dataset());

        var points = chart.plotArea.selectAll('circle.' + selector)
            .data(scatterData);

        points.enter()
            .append('circle')
            .attr('class', className)
            .on('mouseover', this.mouseOver)
            .on('mouseout', this.mouseOut)
            .on('click', click);

        points
            .attr('r', radiusFunction)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('opacity', opacityFunction)
            .attr('fill', this.color);
    };
};

insight.ScatterSeries.prototype = Object.create(insight.Series.prototype);
insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;
