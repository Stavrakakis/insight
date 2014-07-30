insight.Dimension = (function(insight) {
    /**
     * A Dimension organizes a dataset along a particular property, or variation of a property.
     * Defining a dimension with a function of:<pre><code>function(d){ return d.Surname; }</code></pre> will slice a dataset by the distinct values of the Surname property.
     * @constructor
     * @todo reimplement how Dimensions are created.  Too much is inside ChartGroup at the moment, and ChartGroup is becoming redundant and too mixed
     * @todo display function should be provided by a setter.
     * @param {String} name - The short name used to identify this dimension, and any linked dimensions sharing the same name
     * @param {function} dimension - The function used to categorize points within the dimension.
     * @param {dimension} dimension - The crossfilter dimension representing this dimension (TODO: create this inside the constructor - should be invisible)
     * @param {function} dimension - The function used to generate a displayable string for this dimension, to be used as a label or otherwise (TODO: is this the business of this constructor or even object?)
     * @param {boolean} oneToMany - Whether or not this dimension represents a collection of possible values in each item.
     * @class
     */
    var Dimension = function Dimension(name, func, dimension, displayFunction, oneToMany) {
        this.crossfilterDimension = dimension;
        this.name = name;
        this.filters = [];
        this.oneToMany = oneToMany;

        var self = this;

        this.displayFunction = displayFunction ? displayFunction : function(d) {
            return d;
        };

        this.comparer = function(d) {
            return d.name == self.name;
        };


    };

    return Dimension;

})(insight);
