(function(insight) {

    /**
     * The Chart class is the element in which series and axes are drawn
     * @class insight.Chart
     * @param {string} name - A uniquely identifying name for this chart
     * @param {string} element - The css selector identifying the div container that the chart will be drawn in. '#columnChart' for example.
     */
    insight.Chart = (function(insight) {

        function Chart(name, element) {

            this.name = name;
            this.element = element;
            this.selectedItems = [];
            var legend = null;

            var zoomAxis = null;
            this.container = null;
            this.chart = null;
            this.measureCanvas = document.createElement('canvas');

            this._margin = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };

            this.legendView = null;

            var height = d3.functor(300);
            var width = d3.functor(300);
            var zoomable = false;
            var series = [];
            var xAxes = [];
            var yAxes = [];
            var self = this;
            var title = '';
            var autoMargin = true;


            this.init = function(create, container) {

                self.container = create ? d3.select(container)
                    .append('div') : d3.select(self.element)
                    .append('div');

                self.container
                    .attr('class', insight.Constants.ContainerClass)
                    .style('position', 'relative')
                    .style('display', 'inline-block');

                self.chartSVG = self.container
                    .append('svg')
                    .attr('class', insight.Constants.ChartSVG);

                self.plotArea = self.chartSVG.append('g')
                    .attr('class', insight.Constants.PlotArea);

                self.addClipPath();

                self.draw(false);

                if (zoomable) {
                    self.initZoom();
                }

            };


            this.draw = function(dragging) {
                this.resizeChart();

                var axes = xAxes.concat(yAxes);

                axes.map(function(axis) {
                    axis.draw(self, dragging);
                });

                this.series()
                    .map(function(series) {
                        series.draw(self, dragging);
                    });

                if (legend !== null) {
                    legend.draw(self, self.series());
                }
            };

            this.addClipPath = function() {
                this.plotArea.append('clipPath')
                    .attr('id', this.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', this.width() - this.margin()
                        .left - this.margin()
                        .right)
                    .attr('height', this.height() - this.margin()
                        .top - this.margin()
                        .bottom);
            };


            this.resizeChart = function() {
                if (autoMargin) {
                    self.calculateLabelMargin();
                }

                var chartMargin = self.margin();

                var context = self.measureCanvas.getContext('2d');
                context.font = "15pt Open Sans Bold";

                self.container.style('width', self.width() + 'px');

                self.chartSVG
                    .attr('width', self.width())
                    .attr('height', self.height());

                self.plotArea = this.plotArea
                    .attr('transform', 'translate(' + chartMargin.left + ',' + chartMargin.top + ')');

                self.plotArea.select('#' + self.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', self.width() - chartMargin.left - chartMargin.right)
                    .attr('height', self.height() - chartMargin.top - chartMargin.bottom);
            };


            this.zoomable = function(scale) {
                zoomable = true;
                zoomAxis = scale;
                scale.zoomable(true);
                return this;
            };

            this.initZoom = function() {
                this.zoom = d3.behavior.zoom()
                    .on('zoom', self.dragging.bind(self));

                this.zoom.x(zoomAxis.scale);

                if (!this.zoomExists()) {
                    //Draw ourselves as the first element in the plot area
                    this.plotArea.insert('rect', ':first-child')
                        .attr('class', 'zoompane')
                        .attr('width', this.width())
                        .attr('height', this.height() - this.margin()
                            .top - this.margin()
                            .bottom)
                        .style('fill', 'none')
                        .style('pointer-events', 'all');
                }

                this.plotArea.select('.zoompane')
                    .call(this.zoom);
            };

            this.zoomExists = function() {
                var z = this.plotArea.selectAll('.zoompane');
                return z[0].length;
            };

            this.dragging = function() {
                self.draw(true);
            };

            this.margin = function(_) {
                if (!arguments.length) {
                    return this._margin;
                }

                autoMargin = false;
                this._margin = _;

                return this;
            };

            this.clipPath = function() {

                return insight.Utils.safeString(this.name) + 'clip';
            };


            this.title = function(_) {
                if (!arguments.length) {
                    return title;
                }

                title = _;
                return this;
            };

            this.width = function(_) {
                if (!arguments.length) {
                    return width();
                }

                width = d3.functor(_);
                return this;
            };

            this.height = function(_) {
                if (!arguments.length) {
                    return height();
                }
                height = d3.functor(_);
                return this;
            };

            this.series = function(newSeries) {
                if (!arguments.length) {
                    return series;
                }
                series = newSeries;

                return this;
            };

            this.legend = function(newLegend) {
                if (!arguments.length) {
                    return legend;
                }

                legend = newLegend;

                return this;
            };

            this.addXAxis = function(axis) {
                axis.direction = 'h';
                xAxes.push(axis);
                return this;
            };

            this.xAxes = function(newXAxes) {
                if (!arguments.length) {
                    return xAxes;
                }

                for (var index = 0; index < newXAxes.length; index++) {
                    self.addXAxis(newXAxes[index]);
                }

                return this;
            };

            this.xAxis = function(xAxis) {
                if (!arguments.length) {
                    return xAxes[0];
                }

                var newXAxes = xAxes.slice(0);
                newXAxes[0] = xAxis;
                return this.xAxes(newXAxes);
            };

            this.addYAxis = function(axis) {
                axis.direction = 'v';
                yAxes.push(axis);
                return this;
            };

            this.yAxes = function(newYAxes) {
                if (!arguments.length) {
                    return yAxes;
                }

                for (var index = 0; index < newYAxes.length; index++) {
                    self.addYAxis(newYAxes[index]);
                }

                return this;
            };

            this.yAxis = function(yAxis) {
                if (!arguments.length) {
                    return yAxes[0];
                }

                var newYAxes = yAxes.slice(0);
                newYAxes[0] = yAxis;
                return this.yAxes(newYAxes);
            };

            this.addHorizontalScale = function(type, typeString, direction) {
                var scale = new Scale(this, type, direction, typeString);
            };


            this.addHorizontalAxis = function(scale) {
                var axis = new Axis(this, scale, 'h', 'left');
            };


            this.autoMargin = function(_) {
                if (!arguments.length) {
                    return autoMargin;
                }
                autoMargin = _;
                return this;
            };


            this.highlight = function(selector, value) {

                var clicked = this.plotArea.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.plotArea.selectAll('.selected');
                var notselected = this.plotArea.selectAll('.bar:not(.selected),.bubble:not(.selected)');

                notselected.classed('notselected', selected[0].length > 0);
            };

            insight.addChart(this);
        }



        Chart.prototype.calculateLabelMargin = function() {

            var canvas = this.measureCanvas;
            var max = 0;
            var margin = {
                "top": 0,
                "left": 0,
                "bottom": 0,
                "right": 0
            };

            this.series()
                .forEach(function(series) {
                    var xAxis = series.x;
                    var yAxis = series.y;

                    var labelDimensions = series.maxLabelDimensions(canvas);

                    margin[xAxis.orientation()] = Math.max(labelDimensions.maxKeyHeight, margin[xAxis.orientation()]);
                    margin[yAxis.orientation()] = Math.max(labelDimensions.maxValueWidth, margin[yAxis.orientation()]);
                });

            this.margin(margin);
        };

        return Chart;

    })(insight);
})(insight);
