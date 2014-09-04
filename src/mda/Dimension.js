(function(insight) {
    /**
     * A Dimension organizes a dataset along a particular property, or variation of a property.
     * Defining a dimension with a function of:<pre><code>function(d){ return d.Surname; }</code></pre> will slice a dataset by the distinct values of the Surname property.
     * @constructor
     * @todo reimplement how Dimensions are created.  Too much is inside ChartGroup at the moment, and ChartGroup is becoming redundant and too mixed
     * @todo display function should be provided by a setter.
     * @param {String} name - The short name used to identify this dimension, and any linked dimensions sharing the same name
     * @param {crossfilter} crossfilterData - The crossfilter object to create the Dimension on.
     * @param {function} sliceFunction - The function used to categorize points within the dimension.
     * @param {boolean} oneToMany - Whether or not this dimension represents a collection of possible values in each item.
     * @class
     */
    insight.Dimension = function Dimension(name, crossfilterData, sliceFunction, oneToMany) {

        this.crossfilterDimension = crossfilterData.dimension(sliceFunction);
        this.name = name;
        this.filters = [];
        this.oneToMany = oneToMany;
        this.aggregationFunction = sliceFunction;

        var self = this;

        var oneToManyFilterFunction = function(filterValue) {
            return function(d) {
                return insight.Utils.arrayContains(d, filterValue);
            };
        };

        var filterFunction = function(filterValue) {
            return function(d) {
                return String(d) === String(filterValue);
            };
        };

        /*
         * Local helper function that creates a filter object given an element that has been clicked on a Chart or Table.
         * The filter object creates the function used by crossfilter to remove or add objects to an aggregation after a filter event.
         * It also includes a simple name variable to use for lookups.
         * @memberof! insight.Dimension
         * @param {object} filteredValue - The value to create a crossfilter filter function for.
         * @returns {function} - A function that a crossfilterdimension.filter() operation can use to map-reduce crossfilter aggregations.
         */
        this.createFilterFunction = function(filteredValue) {

            // create the appropriate type of filter function for this Dimension
            var filterFunc = self.oneToMany ? oneToManyFilterFunction(filteredValue) : filterFunction(filteredValue);

            return {
                name: filteredValue,
                filterFunction: filterFunc
            };
        };

    };

})(insight);
