/**
 * A Grouping is generated on a dimension, to reduce the items in the data set into groups along the provided dimension
 * @class insight.Grouping
 * @constructor
 * @param {dimension} dimension - The dimension to group
 */
insight.Grouping = (function(insight) {

    function Grouping(dimension) {



        //private variables

        var sumProperties = [],
            countProperties = [],
            cumulativeProperties = [],
            averageProperties = [],
            ordered = false,
            self = this,
            filterFunction = null,
            orderFunction;



        //public variables

        this.dimension = dimension;

        // Private methods

        // The default post aggregation step is blank, and can be overriden by users if they want to calculate additional values with this Grouping
        var postAggregation = function(grouping) {

        };



        /*
         * This function takes an object and a property name in the form of a string, traversing the object until it finds a property with that name and returning
         * a wrapped object with the immediate parent of the found property and the property's value.
         * @param {object} - The object to search
         * @param {string} propertyName - A string of the property to search, can include sub-properties using a dot notation. Eg. 'value.Revenue.Sum', which cannot be indexed directly in Javascript.
         */
        var getDescendant = function(obj, propertyName) {
            var arr = propertyName.split(".");
            var name = propertyName;
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

        /*
         * This function takes a group object and calculates the mean for any properties configured.
         * @param {object} group - A dimensional slice of a Grouping {key: 'X', value : {}}
         */
        var calculateAverages = function(group) {


            for (var i = 0, len = averageProperties.length; i < len; i++) {

                var propertyName = averageProperties[i];
                var propertyValue = group.value[propertyName];
                var mean = propertyValue.Sum / group.value.Count;

                mean = insight.Utils.isNumber(mean) && isFinite(mean) ? mean : 0;

                group.value[propertyName].Average = mean;
            }
        };

        /*
         * This method calculates running cumulative values for any properties defined in the cumulative() list.
         * @param {object} group - The data group being added to the cumulative running totals list
         * @param {object} totals - The map object of running totals for the defined properties
         */
        var calculateCumulativeValues = function(group, totals) {

            var propertyName,
                descendant;

            for (var i = 0, len = cumulativeProperties.length; i < len; i++) {

                propertyName = cumulativeProperties[i];
                descendant = getDescendant(group.value, propertyName);

                var totalName = descendant.propertyName + 'Cumulative';

                totals[totalName] = totals[totalName] ? totals[totalName] + descendant.value : descendant.value;

                descendant.container[totalName] = totals[totalName];

            }

            return totals;
        };

        /*
         * This method is used to calculate any values that need to run after the data set has been aggregated into groups and basic values
         */
        var postAggregationCalculations = function() {

            var totals = {};

            var data = self.ordered() ? self.getData(self.orderFunction()) : self.getData();

            data.forEach(function(d) {

                calculateAverages(d);

                calculateCumulativeValues(d, totals);

            });

            // Run any user injected functions post aggregation
            postAggregation(self);
        };

        /*
         * This function is called by the map reduce process on a DataSet when an input object is being added to the aggregated group
         * @returns {object} group - The group entry for this slice of the aggregated dataset, modified by the addition of the data object
         * @param {object} group - The group entry for this slice of the aggregated dataset, prior to adding the input data object
         * @param {object} data - The object being added from the aggregated group.
         */
        var reduceAddToGroup = function(group, data) {

            group.Count++;

            var propertyName,
                i,
                len;

            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    group[propertyName].Sum += data[propertyName];
                }
            }

            // Increment the counts of the different occurences of any properties defined. E.g: if a property 'Country' can take multiple string values, 
            // this counts the occurences of each distinct value the property takes
            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];

                var groupProperty = group[propertyName];

                if (data.hasOwnProperty(propertyName)) {

                    var propertyValue = data[propertyName];

                    // If this property holds multiple values, increment the counts for each one.
                    if (insight.Utils.isArray(propertyValue)) {

                        for (var subIndex in propertyValue) {
                            var subVal = propertyValue[subIndex];
                            //Initialize or increment the count for this occurence of the property value
                            group[propertyName][subVal] = groupProperty.hasOwnProperty(subVal) ? groupProperty[subVal] + 1 : 1;
                            group[propertyName].Total++;
                        }
                    } else {
                        group[propertyName][propertyValue] = groupProperty.hasOwnProperty(propertyValue) ? groupProperty[propertyValue] + 1 : 1;
                        group[propertyName].Total++;
                    }
                }
            }


            return group;
        };

        /*
         * This function is called by the map reduce process on a DataSet when an input object is being filtered out of the group
         * @returns {object} group - The group entry for this slice of the aggregated dataset, modified by the removal of the data object
         * @param {object} group - The group entry for this slice of the aggregated dataset, prior to removing the input data object
         * @param {object} data - The object being removed from the aggregated group.
         */
        var reduceRemoveFromGroup = function(group, data) {

            group.Count--;

            var propertyName,
                i,
                len;

            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    group[propertyName].Sum -= data[propertyName];
                }
            }

            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];

                if (data.hasOwnProperty(propertyName)) {

                    var propertyValue = data[propertyName];

                    if (insight.Utils.isArray(propertyValue)) {

                        for (var subIndex in propertyValue) {
                            var subVal = propertyValue[subIndex];
                            group[propertyName][subVal] = group[propertyName].hasOwnProperty(subVal) ? group[propertyName][subVal] - 1 : 0;
                            group[propertyName].Total--;
                        }

                    } else {
                        group[propertyName][propertyValue] = group[propertyName].hasOwnProperty(propertyValue) ? group[propertyName][propertyValue] - 1 : 0;
                        group[propertyName].Total--;
                    }
                }
            }

            return group;
        };

        /*
         * This method is called when a slice of an aggrgated DataSet is being initialized, creating initial values for certain properties
         * @returns {object} return - The initialized slice of this aggreagted DataSet.  The returned object will be of the form {key: 'Distinct Key', value: {}}
         */
        var reduceInitializeGroup = function() {
            var group = {
                    Count: 0
                },
                propertyName,
                i,
                len;


            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                group[propertyName] = group[propertyName] ? group[propertyName] : {};
                group[propertyName].Sum = 0;
            }

            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];
                group[propertyName] = group[propertyName] ? group[propertyName] : {};
                group[propertyName].Total = 0;
            }

            return group;
        };




        /*
         * This aggregation method is tailored to dimensions that can hold multiple values (in an array), therefore they are counted differently.
         * For example: a property called supportedDevices : ['iPhone5', 'iPhone4'] where the values inside the array are treated as dimensional slices
         * @returns {object[]} return - the array of dimensional groupings resulting from this dimensional aggregation
         */
        var reduceMultidimension = function() {

            var propertiesToCount = self.count();

            var propertyName,
                i,
                index = 0,
                len,
                gIndices = {};

            function reduceAdd(p, v) {

                for (i = 0, len = propertiesToCount.length; i < len; i++) {

                    propertyName = propertiesToCount[i];

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
                for (i = 0, len = propertiesToCount.length; i < len; i++) {

                    propertyName = propertiesToCount[i];

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

            data = self.dimension.crossfilterDimension.groupAll()
                .reduce(reduceAdd, reduceRemove, reduceInitial);

            self.orderFunction(function(a, b) {
                return b.value - a.value;
            });

            return data;
        };


        // Public methods


        /**
         * Gets the function that will run after the map reduce stage of this Grouping's aggregation. This is an empty function by default, and can be overriden by the setter.
         * @instance
         * @memberof! insight.Grouping
         * @returns {function} - The function that will run after aggregation of this Grouping.
         * @also
         * Sets the function that will run after any aggregation has been performed on this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} postAggregationFunc - A user defined function of the form function(grouping), that the Grouping will run post aggregation.
         */
        this.postAggregation = function(postAggregationFunc) {
            if (!arguments.length) {
                return postAggregation;
            }
            postAggregation = postAggregationFunc;
            return this;
        };

        /**
         * Returns the list of properties to be summed on this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be summed
         * @also
         * Sets the list of property names that will be summed in this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be summed for slices in this Grouping.
         */
        this.sum = function(properties) {
            if (!arguments.length) {
                return sumProperties;
            }
            sumProperties = properties;
            return this;
        };

        /**
         * Returns the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be cumulatively summed
         * @also
         * Sets the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be cumulatively summed over slices in this Grouping.
         */
        this.cumulative = function(properties) {
            if (!arguments.length) {
                return cumulativeProperties;
            }
            cumulativeProperties = properties;
            return this;
        };

        /**
         * Returns the array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names whose values will be counted
         * @also
         * Sets the array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         */
        this.count = function(properties) {
            if (!arguments.length) {
                return countProperties;
            }
            countProperties = properties;
            return this;
        };

        /**
         * Returns the array of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will averaged
         * @also
         * Sets the array of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties that will be averaged after the map reduce of this Grouping.
         */
        this.mean = function(properties) {
            if (!arguments.length) {
                return averageProperties;
            }
            averageProperties = properties;

            sumProperties = insight.Utils.arrayUnique(sumProperties.concat(averageProperties));

            return this;
        };

        /**
         * Gets or sets the function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {function} orderingFunction - The function used to compare two values when sort() is called on an array
         * @also
         * Sets the function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {function} function - The comparison function to be used to sort the elements in this group.  The function should take the form of a standard {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/GlobalvalueObjects/Array/sort|Javascript comparison function}.
         */
        this.orderFunction = function(orderingFunction) {
            if (!arguments.length) {
                return orderFunction;
            }
            orderFunction = orderingFunction;
            return this;
        };


        /**
         * Gets or sets whether the group's data is ordered.
         * @instance
         * @memberof! insight.Grouping
         * @returns {boolean}
         * @also
         * Sets if this Grouping will be ordered or not
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {boolean} ordered - Whether to order this Grouping or not
         */
        this.ordered = function(value) {
            if (!arguments.length) {
                return ordered;
            }
            ordered = value;

            return this;
        };

        /**
         * The filter method gets or sets the function used to filter the results returned by this grouping.
         * @param {function} filterFunction - A function taking a parameter representing an object in the list.  The function must return true or false as per <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/GlobalvalueObjects/Array/filter">Array Filter</a>.
         */
        this.filter = function(f) {
            if (!arguments.length) {
                return filterFunction;
            }
            filterFunction = f;
            return this;
        };




        /**
         * This method is called when any post aggregation calculations need to be recalculated.
         * For example, calculating group percentages after totals have been created during map-reduce.
         * @memberof! insight.Grouping
         * @instance
         */
        this.recalculate = function() {

            postAggregationCalculations();
        };

        /**
         * This method performs the aggregation of the underlying crossfilter dimension, calculating any additional properties during the map-reduce phase.
         * It must be run prior to a group being used
         * @todo This should probably be run during the constructor? If not, lazily evaluated by getData() if it hasn't been run already.
         */
        this.initialize = function() {

            var data;

            if (self.dimension.oneToMany) {
                // Dimensions that are one to many {supportedLanguages: ['EN', 'DE']} as opposed to {supportedLanguage: 'EN'} need to be aggregated differently
                data = reduceMultidimension();
            } else {
                // this is crossfilter code.  It calls the crossfilter.group().reduce() functions on the crossfilter dimension wrapped inside our insight.Dimension
                // more info at https://github.com/square/crossfilter/wiki/API-Reference
                // the add, remove and initialie functions are called when crossfilter is aggregating the groups, and is amending the membership of the different 
                // dimensional slices (groups) 
                data = self.dimension.crossfilterDimension.group()
                    .reduce(
                        reduceAddToGroup,
                        reduceRemoveFromGroup,
                        reduceInitializeGroup
                );
            }

            self.data = data;

            postAggregationCalculations(self);

            return this;
        };


        /**
         * This method is used to return the group's data, without ordering.  It checks if there is any filtering requested and applies the filter to the return array.
         * @memberof! insight.Grouping
         * @instance
         * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
         */
        this.getData = function(orderFunction, top) {
            var data;

            // Set the provided order function if it has been given, otherwise use the inherent grouping order if one has been defined.
            var orderFunc = orderFunction ? orderFunction : self.orderFunction();

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

            if (orderFunc) {
                data = data.sort(orderFunc);
            }
            if (top) {
                data = data.slice(0, top);
            }

            if (filterFunction) {
                data = data.filter(filterFunction);
            }

            return data;
        };

    }

    return Grouping;

})(insight);
