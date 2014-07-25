insight.DataSet = (function(insight) {
    /**
     * A DataSet is wrapper around a simple object array, but providing some functions that are required by charts to load and filter data.
     * A DataSet should be used with an array of data that is to be charted without being used in a crossfilter or dimensional dataset.
     * @constructor
     * @param {object[]} data - The short name used to identify this dimension, and any linked dimensions sharing the same name
     */
    function DataSet(data) {

        this._data = data;

        this.Dimensions = [];
        this.Groups = [];

        this.ndx = null;

        this._orderFunction = function(a, b) {
            return b.value - a.value;
        };

        this._filterFunction = null;
    }

    DataSet.prototype.initialize = function() {

    };

    DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    DataSet.prototype.getData = function() {
        var data;
        if (this._data.all) {
            data = this._data.all();
        } else {
            //not a crossfilter set
            data = this._data;
        }

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };

    DataSet.prototype.orderFunction = function(o) {
        if (!arguments.length) {
            return this._orderFunction;
        }
        this._orderFunction = o;
        return this;
    };

    DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    DataSet.prototype.getOrderedData = function() {
        var data;

        data = this._data.sort(this._orderFunction);

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };


    DataSet.prototype.group = function(name, groupFunction, oneToMany) {

        this.ndx = !this.ndx ? crossfilter(this._data) : this.ndx;

        var dim = new insight.Dimension(name, groupFunction, this.ndx.dimension(groupFunction), groupFunction, oneToMany);

        var group = new insight.Grouping(dim);

        insight.Dimensions.push(dim);
        insight.Groups.push(group);

        group.filterHandler = insight.chartFilterHandler.bind(insight);

        return group;
    };

    return DataSet;

})(insight);
