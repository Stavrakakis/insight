(function(insight) {

    /**
     * The ChartGroup class is a container for Charts and Tables, linking them together and coordinating cross chart filtering and styling.
     * @class insight.ChartGroup
     */

    insight.ChartGroup = (function(insight) {

        function ChartGroup() {

            this.charts = [];
            this.tables = [];
            this.groupings = [];
            this.dimensions = [];
            this.filteredDimensions = [];
            this.dimensionListenerMap = {};

            // private variables
            var self = this;

            // private methods

            /*
             * Local helper function that creates a filter object given an element that has been clicked on a Chart or Table.
             * The filter object creates the function used by crossfilter to remove or add objects to an aggregation after a filter event.
             * It also includes a simple name variable to use for lookups
             */
            var createFilterFunction = function(filter) {
                var value = filter.key ? filter.key : filter;

                return {
                    name: value,
                    filterFunction: function(d) {
                        if (Array.isArray(d)) {
                            return d.indexOf(value) != -1;
                        } else {
                            return String(d) == String(value);
                        }
                    }
                };
            };

            /*
             * A helper functions used by Array.filter on an array of Dimension objects, to return any Dimensions in the list whose name matches the provided filter function.
             */
            var compareFilters = function(filterFunction) {
                return function(d) {
                    return String(d.name) == String(filterFunction.name);
                };
            };


            /*
             * This internal function responds to click events on Series and Tables, alerting any other elements using the same Dimension that they need to
             * update to highlight the selected slices of the Dimension
             */
            var applyCSSClasses = function(item, value, dimensionSelector) {
                var listeningObjects = self.dimensionListenerMap[item.data.dimension.name];

                listeningObjects.forEach(function(item) {
                    item.highlight(dimensionSelector, value);
                });
            };

            /*
             * This function takes a list of series and binds the click events of each one to the ChartGroup filtering handler
             * It also adds the series' dataset to the internal list.
             */
            var addSeries = function(seriesArray) {
                seriesArray.forEach(function(series) {
                    series.clickEvent = self.chartFilterHandler.bind(self);
                    addDataSet(series.data);
                });
            };

            /* 
             * This function is called when a Chart belonging to this ChartGroup updates its list of Series.
             * The ChartGroup needs to register the click events and any crossfilter dimensions belonging to the Series
             */
            var newSeries = function(series) {

                addSeries(series);
            };


            /* 
             *
             */
            var addDataSet = function(dataset) {

                // If this is a crossfilter enabled DataSet (aggregated and filter enabled)
                var crossfilterEnabled = dataset.dimension;

                if (crossfilterEnabled) {

                    // Add Grouping and Dimension to internal lists if they are not already there             
                    insight.Utils.addToSet(self.groupings, dataset);
                    insight.Utils.addToSet(self.dimensions, dataset.dimension);
                }
            };


            /*
             * Given a DataSet and a widget (Table or Chart), this function adds the widget to the map of items subscribed to events on that Dimension,
             * only if the provided DataSet is a crossfilter enabled one that exposes a dimension property.
             */
            var addDimensionListener = function(dataset, widget) {
                var dimension = dataset.dimension;

                if (dimension) {
                    var listeningObjects = self.dimensionListenerMap[dimension.name];

                    if (listeningObjects) {

                        var alreadyListening = listeningObjects.indexOf(widget) != -1;

                        if (!alreadyListening) {
                            self.dimensionListenerMap[dimension.name].push(widget);
                        }
                    } else {
                        self.dimensionListenerMap[dimension.name] = [widget];
                    }
                }
            };

            // public methods

            /**
             * Redraws all Chart and Table objects contained by this ChartGroup
             * @memberof! insight.ChartGroup
             * @instance
             */
            this.redraw = function() {
                self.charts.forEach(function(chart) {
                    chart.draw();
                });

                self.tables.forEach(function(table) {
                    table.draw();
                });
            };


            /**
             * Adds a Table to this ChartGroup, wiring up the Table's events to any related Charts or Tables in the ChartGroup
             * @memberof! insight.ChartGroup
             * @instance
             */
            this.addTable = function(table) {

                // wire up the click event of the table to the filter handler of the DataSet
                table.clickEvent = self.chartFilterHandler.bind(self);

                self.tables.push(table);

                return table;
            };




            /**
             * Adds a Chart to this ChartGroup, wiring up the click events of each Series to the filter handler
             * @memberof! insight.ChartGroup
             * @instance
             */
            this.addChart = function(chart) {

                chart.seriesChanged = newSeries;

                addSeries(chart.series());

                self.charts.push(chart);

                return chart;
            };


            /**
             * Draws all Charts and Tables in this ChartGroup
             * TODO - rename as it should only be called once, maybe to init()?
             * @memberof! insight.ChartGroup
             * @instance
             */
            this.draw = function() {

                self.charts
                    .forEach(
                        function(chart) {
                            chart.series()
                                .forEach(function(series) {
                                    addDimensionListener(series.data, chart);
                                });

                            chart.init();
                        });

                self.tables.forEach(function(table) {
                    addDimensionListener(table.data, table);
                    table.draw();
                });
            };

            this.chartFilterHandler = function(chart, value, dimensionSelector) {

                applyCSSClasses(chart, value, dimensionSelector);

                var dimension = chart.data.dimension;

                var filterFunc = createFilterFunction(value);

                if (filterFunc) {
                    var dims = self.dimensions
                        .filter(dimension.comparer);

                    var activeDim = self.filteredDimensions
                        .filter(dimension.comparer);

                    if (!activeDim.length) {
                        self.filteredDimensions.push(dimension);
                    }

                    var comparerFunction = compareFilters(filterFunc);

                    dims.map(function(dim) {

                        var filterExists = dim.filters
                            .filter(comparerFunction)
                            .length;

                        //if the dimension is already filtered by this value, toggle (remove) the filter
                        if (filterExists) {
                            insight.Utils.removeMatchesFromArray(dim.filters, comparerFunction);

                        } else {
                            // add the provided filter to the list for this dimension

                            dim.filters.push(filterFunc);
                        }

                        // reset this dimension if no filters exist, else apply the filter to the dataset.
                        if (dim.filters.length === 0) {

                            insight.Utils.removeItemFromArray(self.filteredDimensions, dim);
                            dim.crossfilterDimension.filterAll();

                        } else {
                            dim.crossfilterDimension.filter(function(d) {
                                var vals = dim.filters
                                    .map(function(func) {
                                        return func.filterFunction(d);
                                    });

                                return vals.filter(function(result) {
                                        return result;
                                    })
                                    .length > 0;
                            });
                        }
                    });

                    // the above filtering will have triggered a re-aggregation of the groupings.  We must manually initiate the recalculation
                    // of the groupings for any post aggregation calculations
                    self.groupings.forEach(function(group) {
                        group.recalculate();

                    });

                    self.redraw();
                }
            };
        }

        return ChartGroup;

    })(insight);
})(insight);
