/**
 * The MarkerSeries class extends the Series class and draws markers/targets on a chart
 * @class insight.MarkerSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.MarkerSeries = function MarkerSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var self = this,
        thickness = 5,
        widthFactor = 1,
        offset = 0,
        horizontal = false,
        vertical = true;

    this.xPosition = function(d) {
        var pos = 0;

        if (vertical) {
            pos = self.x.scale(self.keyFunction()(d));

            if (!offset) {
                offset = self.calculateOffset(d);
            }

            pos = widthFactor != 1 ? pos + offset : pos;
        } else {
            pos = self.x.scale(self.valueFunction()(d));

        }

        return pos;
    };


    this.keys = function() {

        var f = self.keyFunction();

        return self.dataset()
            .map(f);
    };

    this.calculateOffset = function(d) {

        var thickness = horizontal ? self.markerHeight(d) : self.markerWidth(d);
        var scalePos = horizontal ? self.y.scale.rangeBand(d) : self.x.scale.rangeBand(d);

        return (scalePos - thickness) * 0.5;
    };

    this.yPosition = function(d) {

        var position = 0;

        if (horizontal) {
            position = self.y.scale(self.keyFunction()(d));

            if (!offset) {
                offset = self.calculateOffset(d);
            }

            position = widthFactor != 1 ? position + offset : position;

        } else {
            position = self.y.scale(self.valueFunction()(d));
        }

        return position;
    };

    this.horizontal = function() {
        horizontal = true;
        vertical = false;

        return this;
    };

    this.vertical = function() {
        vertical = true;
        horizontal = false;
        return this;
    };

    this.widthFactor = function(_) {

        if (!arguments.length) {
            return widthFactor;
        }
        widthFactor = _;
        return this;
    };

    this.thickness = function(_) {
        if (!arguments.length) {
            return thickness;
        }
        thickness = _;
        return this;
    };

    this.markerWidth = function(d) {
        var w = 0;

        if (horizontal) {
            w = self.thickness();
        } else {
            w = self.x.scale.rangeBand(d) * widthFactor;
        }

        return w;
    };

    this.markerHeight = function(d) {
        var h = 0;

        if (horizontal) {
            h = self.y.scale.rangeBand(d) * widthFactor;
        } else {
            h = self.thickness();
        }

        return h;
    };



    this.draw = function(chart, drag) {

        self.initializeTooltip(chart.container.node());
        self.selectedItems = chart.selectedItems;
        self.rootClassName = this.seriesClassName();

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var d = this.dataset()
            .forEach(reset);

        var groups = chart.plotArea
            .selectAll('g.' + insight.Constants.BarGroupClass + "." + this.name)
            .data(this.dataset(), this.keyAccessor);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', insight.Constants.BarGroupClass + " " + this.name);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.click(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };

        newBars = newGroups.append('rect')
            .attr('class', self.itemClassName)
            .attr('y', this.y.bounds[0])
            .attr('height', 0)
            .attr('fill', this.color)
            .attr('clip-path', 'url(#' + chart.clipPath() + ')')
            .on('mouseover', this.mouseOver)
            .on('mouseout', this.mouseOut)
            .on('click', click);

        var bars = groups.selectAll('.' + this.name + 'class');

        bars
            .transition()
            .duration(duration)
            .attr('y', this.yPosition)
            .attr('x', this.xPosition)
            .attr('width', this.markerWidth)
            .attr('height', this.markerHeight);

        groups.exit()
            .remove();
    };

    return this;
};

insight.MarkerSeries.prototype = Object.create(insight.Series.prototype);
insight.MarkerSeries.prototype.constructor = insight.MarkerSeries;
