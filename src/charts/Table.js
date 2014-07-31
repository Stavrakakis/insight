(function(insight) {

    insight.Table = (function() {

        /**
         * The Table class draws HTML tables from DataSets
         * @class insight.Table
         * @param {string} name - A uniquely identifying name for this table
         * @param {string} element - The css selector identifying the div container that the table will be drawn in. '#dataTable' for example.
         * @param {DataSet} dataset - The DataSet to render this Table from
         */
        function Table(name, element, dataset) {

            // Publicly accessible properties

            this.name = name;
            this.element = element;
            this.data = dataset;
            this.selectedItems = [];

            // private variables

            var self = this,
                columnProperties = [],
                tableInitialized = false,
                header,
                sortFunctions = [],
                topValues = null;


            // private methods

            var labelFunction = function(d) {
                return d.label;
            };
            var keyFunction = function(d) {
                return d.key;
            };
            var valueFunction = function(d) {
                return d.value;
            };

            var columnBuilder = function(row) {

                return self.columns()
                    .map(function(column) {
                        return {
                            column: column,
                            value: column.value(row)
                        };
                    });
            };


            // Creates the main <table>, <thead> and <tbody> sections of this Table
            var initializeTable = function() {
                self.tableElement = d3.select(self.element)
                    .append('table')
                    .attr('class', insight.Constants.TableClass);

                header = self.tableElement.append('thead')
                    .append('tr');

                header.append('th')
                    .attr('class', 'blank')
                    .html('');

                self.tableBody = self.tableElement.append('tbody');

                tableInitialized = true;
            };


            var rowClass = function(dataPoint) {
                return insight.Constants.TableRowClass + ' ' + insight.Utils.keySelector(dataPoint, keyFunction);
            };


            var click = function(dataItem) {

                var selector = insight.Utils.keySelector(dataItem, keyFunction);

                self.clickEvent(self, dataItem, selector);
            };

            // Adds sorters to this Table's list of sorting methods and orders.
            // @param {string} order - 'ASC' or 'DESC'
            var addSortOrder = function(func, order) {
                var sort = {
                    sortParameter: func,
                    order: order
                };

                sortFunctions.push(sort);
            };

            // Public methods

            /**
             * The properties of the DataSet to use as columns.
             * @memberof! insight.Table
             * @instance
             * @returns {object[]} - The current properties used as columns, of the form {'label':... , 'value':... }.
             *
             * @also
             *
             * Sets the properties of the DataSet to use as columns.
             * @memberof! insight.Table
             * @instance
             * @param {object[]} columnProperties - The new properties to use as columns, of the form {'label':... , 'value':... }.
             * @returns {this}
             */
            this.columns = function(value) {
                if (!arguments.length) {
                    return columnProperties;
                }
                columnProperties = value;
                return this;
            };


            /**
             * The key function to use for this Table.
             * @memberof! insight.Table
             * @instance
             * @returns {function} - The function to use as the key accessor for this Table
             *
             * @also
             *
             * Sets the properties of the DataSet to use as columns.
             * @memberof! insight.Table
             * @instance
             * @param {function} keyFunc - The function to use as the key accessor for this Table
             * @returns {this}
             */
            this.keyFunction = function(keyFunc) {
                if (!arguments.length) {
                    return keyFunction;
                }
                keyFunction = keyFunc;
                return this;
            };

            /**
             * This method adds an ascending sort to this Table's rows using the provided function as a comparison
             * @memberof! insight.Table
             * @instance
             * @param {function} sortFunction A function extracting the property to sort on from a data object.
             * @returns {object} this Returns the Table object
             */
            this.ascending = function(sortFunction) {

                addSortOrder(sortFunction, 'ASC');

                return this;
            };


            /**
             * Adds a descending sort to this Table's rows using the provided function as a comparison
             * @memberof! insight.Table
             * @instance
             * @param {function} sortFunction A function extracting the property to sort on from a data object.
             * @returns {object} this Returns the Table object.
             */
            this.descending = function(sortFunction) {

                addSortOrder(sortFunction, 'DESC');

                return this;
            };

            /**
             * The number of rows to display. Used in combination with ascending() or descending() to display top or bottom data.
             * @memberof! insight.Table
             * @instance
             * @returns {Number} - The maximum number of top values being displayed.
             *
             * @also
             *
             * Sets the number of rows to display. Used in combination with ascending() or descending() to display top or bottom data.
             * @memberof! insight.Table
             * @instance
             * @param {Number} topValueCount How many values to display in the Table.
             * @returns {this}
             */
            this.top = function(top) {
                if (!arguments.length) {
                    return topValues;
                }
                topValues = top;

                return this;
            };

            this.dataset = function() {

                var sorters = sortFunctions;

                var data = self.data.getData();

                data = insight.Utils.multiSort(data, sorters);

                if (this.top()) {
                    data = data.slice(0, this.top());
                }

                return data;
            };

            // toggle highlighting on items in this table. The provided cssSelector is used to activate or deactivate highlighting on one or more selected rows.
            this.highlight = function(selector) {

                var clicked = self.tableBody.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.tableBody.selectAll('.selected');
                var notselected = this.tableBody.selectAll('tr:not(.selected)');

                notselected.classed('notselected', selected[0].length > 0);
            };


            // The public drawing method for the Table. It will also initialize the <table> element if required.
            this.draw = function() {

                var data = this.dataset();
                var columns = this.columns();

                if (!tableInitialized)
                    initializeTable();

                // draw column headers for properties
                header.selectAll('th.column')
                    .data(columns)
                    .enter()
                    .append('th')
                    .attr('class', 'column')
                    .html(labelFunction);

                var rows = this.tableBody.selectAll('tr.' + insight.Constants.TableRowClass)
                    .data(data, keyFunction);

                rows.enter()
                    .append('tr')
                    .attr('class', rowClass)
                    .on('click', click)
                    .append('th')
                    .html(keyFunction);

                var cells = rows.selectAll('td')
                    .data(columnBuilder);

                cells.enter()
                    .append('td')
                    .html(valueFunction);

                // remove any DOM elements no longer in the data set
                cells.exit()
                    .remove();

                rows.exit()
                    .remove();
            };

            return this;
        }

        /* Skeleton event overriden by any listening objects to subscribe to the click event of the table rows
         * @param {object} series - The row being clicked
         * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
         */
        Table.prototype.clickEvent = function(series, filter) {

        };

        return Table;
    })();
})(insight);
