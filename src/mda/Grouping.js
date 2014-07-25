insight.Grouping = (function(insight) {

    /**
     * A Grouping is generated on a dimension, to reduce the items in the data set into groups along the provided dimension
     * @constructor
     * @param {Dimension} dimension - The dimension to group
     * @class
     */
    function Grouping(dimension) {

        this.dimension = dimension;

        var propertiesToSum = [],
            propertiesToCount = [],
            propertiesToAccumulate = [],
            propertiesToAverage = [],
            totalProperties = [],
            ordered = false,
            self = this,
            filterFunction = null;

        var orderFunction = function(a, b) {
            return b.value.Count - a.value.Count;
        };

        this.registerSeries = function(series) {
            series.clickEvent = this.filterHandler;
        };

        this.filterHandler = function(series, filter, dimensionSelector) {

        };


        /**
         * The sum function gets or sets the properties that this group will sum across.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names in the dataset that will be summed along this grouping's dimension
         * @returns {this}
         */
        this.sum = function(_) {
            if (!arguments.length) {
                return propertiesToSum;
            }
            propertiesToSum = _;
            return this;
        };

        /**
         * The cumulative function gets or sets the properties whose value occurences will be accumulated across this dimension.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have their occuring values accumulated after aggregation
         * @returns {this}
         */
        this.cumulative = function(_) {
            if (!arguments.length) {
                return propertiesToAccumulate;
            }
            propertiesToAccumulate = _;
            return this;
        };

        /**
         * The count function gets or sets the properties whose value occurences will be counted across this dimension.
         * If the provided property contains an array of values, each distinct value in that array will be counted.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have their occuring values counted during aggregation
         * @returns {this}
         */
        this.count = function(_) {
            if (!arguments.length) {
                return propertiesToCount;
            }
            propertiesToCount = _;
            return this;
        };

        /**
         * The total function gets or sets the properties whose value occurences will be totalled across this dimension.
         * If the provided property contains an array of values, each distinct value in that array will be summed across all dimensions.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have their occuring values totalled across all dimensions during aggregation
         * @returns {this}
         */
        this.total = function(_) {
            if (!arguments.length) {
                return totalProperties;
            }
            totalProperties = _;
            return this;
        };

        /**
         * The average function gets or sets the properties whose values will be averaged for across this grouped dimension
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have be averaged during aggregation
         * @returns {this}
         */
        this.mean = function(_) {
            if (!arguments.length) {
                return propertiesToAverage;
            }
            propertiesToAverage = _;

            propertiesToSum = insight.Utils.arrayUnique(propertiesToSum.concat(propertiesToAverage));

            return this;
        };


        /**
         * This method gets or sets the function used to compare the elements in this grouping if sorting is requested.
         * @returns {this}
         * @param {function} function - The comparison function to be used to sort the elements in this group.  The function should take the form of a standard {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Javascript comparison function}.
         */
        this.orderFunction = function(o) {
            if (!arguments.length) {
                return orderFunction;
            }
            orderFunction = o;
            return this;
        };



        /**
         * Gets or sets whether the group's data is ordered.
         * @returns {boolean}
         */
        /**
         * @param {boolean} ordered - a boolean for whether to order the group's values
         * @returns {this}
         */
        this.ordered = function(_) {
            if (!arguments.length) {
                return ordered;
            }
            ordered = _;

            return this;
        };

        /**
         * The filter method gets or sets the function used to filter the results returned by this grouping.
         * @param {function} filterFunction - A function taking a parameter representing an object in the list.  The function must return true or false as per <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">Array Filter</a>.
         */
        this.filter = function(f) {
            if (!arguments.length) {
                return filterFunction;
            }
            filterFunction = f;
            return this;
        };


        /**
         * This aggregation method is tailored to dimensions that can hold multiple values (in an array), therefore they are counted differently.
         * For example: a property called supportedDevices : ['iPhone5', 'iPhone4'] where the values inside the array are treated as dimensional slices
         * @returns {object[]} return - the array of dimensional groupings resulting from this dimensional aggregation
         */
        this.reduceMultiDimension = function() {

            var propertiesToSum = self.sum();
            var propertiesToCount = self.count();
            var propertiesToAverage = self.mean();

            var index = 0;
            var gIndices = {};

            function reduceAdd(p, v) {
                for (var prop in propertiesToCount) {
                    var propertyName = propertiesToCount[prop];

                    if (v.hasOwnProperty(propertyName)) {
                        for (var val in v[propertyName]) {
                            if (typeof(gIndices[v[propertyName][val]]) != "undefined") {
                                var gIndex = gIndices[v[propertyName][val]];

                                p.values[gIndex].value++;
                            } else {
                                gIndices[v[propertyName][val]] = index;

                                p.values[index] = {
                                    key: v[propertyName][val],
                                    value: 1
                                };

                                index++;
                            }
                        }
                    }
                }
                return p;
            }

            function reduceRemove(p, v) {
                for (var prop in propertiesToCount) {
                    var propertyName = propertiesToCount[prop];

                    if (v.hasOwnProperty(propertyName)) {
                        for (var val in v[propertyName]) {
                            var property = v[propertyName][val];

                            var gIndex = gIndices[property];

                            p.values[gIndex].value--;
                        }
                    }
                }
                return p;
            }

            function reduceInitial() {

                return {
                    values: []
                };
            }

            data = self.dimension.Dimension.groupAll()
                .reduce(reduceAdd, reduceRemove, reduceInitial);

            self.orderFunction(function(a, b) {
                return b.value - a.value;
            });

            return data;
        };

        /**
         * This method is called when any post aggregation calculations need to be recalculated.
         * For example, calculating group percentages after totals have been created during map-reduce.
         */
        this.recalculate = function() {

            self.postAggregationCalculations();
        };

        /**
         * This method performs the aggregation of the underlying crossfilter dimension, calculating any additional properties during the map-reduce phase.
         * It must be run prior to a group being used
         * @todo This should probably be run during the constructor? If not, lazily evaluated by getData() if it hasn't been run already.
         */
        this.initialize = function() {
            var propertiesToSum = this.sum();
            var propertiesToCount = this.count();
            var propertiesToAverage = this.mean();
            var propertyName = "";

            var data = [];

            if (self.dimension.oneToMany) {
                data = self.reduceMultiDimension();
            } else {
                data = self.dimension.Dimension.group()
                    .reduce(
                        function(p, v) {
                            p.Count++;

                            for (var property in propertiesToSum) {
                                if (v.hasOwnProperty(propertiesToSum[property])) {
                                    p[propertiesToSum[property]].Sum += v[propertiesToSum[property]];
                                }
                            }

                            for (var countProp in propertiesToCount) {
                                if (v.hasOwnProperty(propertiesToCount[countProp])) {
                                    propertyName = propertiesToCount[countProp];
                                    var propertyValue = v[propertiesToCount[countProp]];

                                    if (insight.Utils.isArray(propertyValue)) {

                                        for (var subIndex in propertyValue) {
                                            var subVal = propertyValue[subIndex];
                                            p[propertyName][subVal] = p[propertyName].hasOwnProperty(subVal) ? p[propertyName][subVal] + 1 : 1;
                                            p[propertyName].Total++;
                                        }

                                    } else {
                                        p[propertyName][propertyValue] = p[propertyName].hasOwnProperty(propertyValue) ? p[propertyName][propertyValue] + 1 : 1;
                                        p[propertyName].Total++;
                                    }
                                }
                            }

                            return p;
                        },
                        function(p, v) {
                            p.Count--;

                            for (var property in propertiesToSum) {
                                if (v.hasOwnProperty(propertiesToSum[property])) {
                                    p[propertiesToSum[property]].Sum -= v[propertiesToSum[property]];
                                }
                            }

                            for (var countProp in propertiesToCount) {
                                if (v.hasOwnProperty(propertiesToCount[countProp])) {

                                    propertyName = propertiesToCount[countProp];
                                    var propertyValue = v[propertiesToCount[countProp]];

                                    if (insight.Utils.isArray(propertyValue)) {

                                        for (var subIndex in propertyValue) {
                                            var subVal = propertyValue[subIndex];
                                            p[propertyName][subVal] = p[propertyName].hasOwnProperty(subVal) ? p[propertyName][subVal] - 1 : 0;
                                            p[propertyName].Total--;
                                        }

                                    } else {
                                        p[propertyName][propertyValue] = p[propertyName].hasOwnProperty(propertyValue) ? p[propertyName][propertyValue] - 1 : 0;
                                        p[propertyName].Total--;
                                    }

                                }
                            }

                            return p;
                        },
                        function() {
                            var p = {
                                Count: 0
                            };

                            for (var property in propertiesToSum) {
                                p[propertiesToSum[property]] = p[propertiesToSum[property]] ? p[propertiesToSum[property]] : {};
                                p[propertiesToSum[property]].Sum = 0;
                            }
                            for (var avProperty in propertiesToAverage) {
                                p[propertiesToAverage[avProperty]] = p[propertiesToAverage[avProperty]] ? p[propertiesToAverage[avProperty]] : {};
                                p[propertiesToAverage[avProperty]].Average = 0;
                            }
                            for (var countProp in propertiesToCount) {
                                p[propertiesToCount[countProp]] = p[propertiesToCount[countProp]] ? p[propertiesToCount[countProp]] : {};
                                p[propertiesToCount[countProp]].Total = 0;
                            }
                            return p;
                        }
                );
            }
            self.data = data;

            self.recalculate();

            return this;
        };


        /**
         * This method is used to return the group's data, without ordering.  It checks if there is any filtering requested and applies the filter to the return array.
         * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
         */
        this.getData = function(orderFunction, top) {
            var data;

            if (!self.data) {
                self.initialize();
            }

            if (this.dimension.oneToMany) {
                data = self.data.value()
                    .values;
            } else {
                data = self.data.all();
            }

            // take a copy of the array to not alter the original dataset
            data = data.slice(0);

            if (orderFunction) {
                data = data.sort(orderFunction);
            }
            if (top) {
                data = data.slice(0, top);
            }

            if (filterFunction) {
                data = data.filter(filterFunction);
            }

            return data;
        };

        this.getDescendant = function(obj, desc) {
            var arr = desc.split(".");
            var name = desc;
            var container = null;

            while (arr.length) {
                name = arr.shift();
                container = obj;
                obj = obj[name];
            }
            return {
                container: container,
                value: obj,
                propertyName: name
            };
        };

        this.calculateAverages = function(group) {

            var propertiesToAverage = self.mean();

            for (var avProperty in propertiesToAverage) {

                var propertyName = propertiesToAverage[avProperty];
                var propertyValue = group.value[propertyName];
                var mean = propertyValue.Sum / group.value.Count;

                mean = insight.Utils.isNumber(mean) & isFinite(mean) ? mean : 0;

                group.value[propertyName].Average = mean;
            }
        };

        /**
         * This method is used to calculate any values that need to run after the data set has been aggregated into groups and basic values
         */
        this.postAggregationCalculations = function() {

            var cumulativeTotals = {};
            var totals = {};

            var data = self.ordered() ? self.getData(this.orderFunction()) : self.getData();

            data.forEach(function(d) {

                self.calculateAverages(d);
                self.calculateCumulativeValues(d, cumulativeTotals);
                self.calculateTotals(d, totals);

            });
        };

        this.calculateTotals = function(d, totals) {

            var propertiesToTotal = self.total();

            propertiesToTotal.map(function(propertyName) {


            });
        };

        /**
         * This method calculates running cumulative values for any properties defined in the cumulative() list.
         * @param {object} data - The data group being added to the cumulative running totals list
         * @param {object} totals - The map object of running totals for the defined properties
         */
        this.calculateCumulativeValues = function(d, cumulativeTotals) {

            var propertiesToAccumulate = this.cumulative();

            propertiesToAccumulate.map(function(propertyName) {

                var resolvedProperty = self.getDescendant(d.value, propertyName);

                var totalName = resolvedProperty.propertyName + 'Cumulative';

                cumulativeTotals[totalName] = cumulativeTotals[totalName] ? cumulativeTotals[totalName] + resolvedProperty.value : resolvedProperty.value;

                resolvedProperty.container[totalName] = cumulativeTotals[totalName];

            });

            return cumulativeTotals;
        };

        return this;
    }

    return Grouping;

})(insight);
