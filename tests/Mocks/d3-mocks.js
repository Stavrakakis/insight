var D3Match = function(el) { 
    this.el = el;
    this.attrs = {};
    this.styles = {};
};

D3Match.prototype.append = function(el) {
    
    var newMatch = new D3Match(el);
    d3.elements[el] = newMatch;
    return newMatch;

};

D3Match.prototype.attr = function(name, value) {

    this.attrs[name] = value;
    return this;
};

D3Match.prototype.style = function(name, value) {

    this.styles[name] = value;
    return this;
    
};

D3Match.prototype.node = function() {

    return this;   
};

D3Match.prototype.select = function(el) {

    return new D3Match(el);

};

var D3Mocks = function() {
    this.elements = {};
}

D3Mocks.prototype.select = function(el) {

    return new D3Match(el);

};