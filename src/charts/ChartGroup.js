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
            var notifyListeners = function(dimensionName, value, dimensionSelector) {
                var listeningObjects = self.dimensionListenerMap[dimensionName];

                listeningObjects.forEach(function(item) {
                    item.highlight(dimensionSelector, value);
                });
            };

            /*
             * This function takes a list of series and binds the click events of each one to the ChartGroup filtering handler
             * It also adds the series' dataset to the internal list.
             */
            var addSeries = function(chart) {
                chart.series()
                    .forEach(function(series) {

                        addDimensionListener(series.data, chart);

                        series.clickEvent = self.chartFilterHandler.bind(self);

                        addDataSet(series.data);
                    });
            };

            /* 
             * This function is called when a Chart belonging to this ChartGroup updates its list of Series.
             * The ChartGroup needs to register the click events and any crossfilter dimensions belonging to the Series
             */
            var newSeries = function(chart, series) {

                addSeries(chart, series);
            };


            /* 
             * This function checks if the provided DataSet is crossfilter enabled, and if so, adds its components to internal lists of Groupings and Dimensions.
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
             * Adds a Table to this ChartGroup, wiring up the Table's events to any related Charts or Tables in the ChartGroup
             * @memberof! insight.ChartGroup
             * @instance
             */
            var addTable = function(table) {

                // wire up the click event of the table to the filter handler of the DataSet
                table.clickEvent = self.chartFilterHandler.bind(self);

                addDimensionListener(table.data, table);

                self.tables.push(table);

                return table;
            };


            /*
             * Adds a Chart to this ChartGroup, wiring up the click events of each Series to the filter handler
             * @memberof! insight.ChartGroup
             * @instance
             */
            var addChart = function(chart) {

                chart.seriesChanged = newSeries;

                addSeries(chart);

                self.charts.push(chart);

                return chart;
            };


            /*
             * Given a DataSet and a widget (Table or Chart), this function adds the widget to the map of items subscribed to events on that Dimension,
             * only if the provided DataSet is a crossfilter enabled one that exposes a dimension property.
             */
            var addDimensionListener = function(dataset, widget) {
                var dimension = dataset ? dataset.dimension : null;

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
             * Adds an item to this ChartGroup, calling the appropriate internal addChart or addTable function depending on the type.
             * @memberof! insight.ChartGroup
             * @instance
             * @param {object} widget - An insight.Table or insight.Chart
             * @returns {this}
             */
            this.add = function(widget) {
                if (widget instanceof insight.Chart) {
                    addChart(widget);
                } else if (widget instanceof insight.Table) {
                    addTable(widget);
                }
                return self;
            };

            /**
             * Draws all Charts and Tables in this ChartGroup
             * TODO - rename as it should only be called once, maybe to init()?
             * @memberof! insight.ChartGroup
             * @instance
             */
            this.draw = function() {

                self.charts.forEach(function(chart) {
                    chart.draw();
                });

                self.tables.forEach(function(table) {
                    table.draw();
                });
            };

            /**
             * Method handler that is bound by the ChartGroup to the click events of any chart series or table rows, if the DataSets used by those entities
             * are crossfilter enabled.
             * It notifies any other listening charts of the dimensional selection event, which they can respond to by applying CSS highlighting etc.
             * @memberof! insight.ChartGroup
             * @instance
             * @param {object} caller - The insight.Table or insight.Chart initiating the click event.
             * @param {object} value - The data item that the dimension is being sliced/filtered by. If it is an aggregation, it will be an object {key:, value:}, otherwise a string.
             * @param {object} widget - An insight.Table or insight.Chart
             * @returns {this}
             */
            this.chartFilterHandler = function(caller, value, dimensionSelector) {

                // send events to any charts or tables also using this dimension, as they will need to update their styles to reflect the selection
                notifyListeners(caller.data.dimension.name, value, dimensionSelector);

                var dimension = caller.data.dimension;

                var filterFunc = dimension.createFilterFunction(value);

                if (filterFunc) {
                    // get the list of any dimensions matching the one that is being filtered
                    var dims = self.dimensions
                        .filter(dimension.comparer);

                    // get the list of matching dimensions that are already filtered
                    var activeDim = self.filteredDimensions
                        .filter(dimension.comparer);

                    // add the new filter to the list of active filters if it's not already active
                    if (!activeDim.length) {
                        self.filteredDimensions.push(dimension);
                    }

                    var comparerFunction = compareFilters(filterFunc);

                    // loop through the matching dimensions to filter them all
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

                    self.draw();
                }
            };
        }

        return ChartGroup;

    })(insight);
})(insight);
