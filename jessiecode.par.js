

JXG.JessieCode = (function() {

// Control structures and functions
var

//Structs

/**
 * Create a new parse tree node.
 * @param {String} type Type of node, e.g. node_op, node_var, or node_const
 * @param value The nodes value, e.g. a variables value or a functions body.
 * @param {Array} children Arbitrary number of child nodes.
 */
node = function(type, value, children) {
    return {
        type: type,
        value: value,
        children: children
    };
},

// Management functions

// Parsed variables
variables = {},
stack = [],

// board currently in use
board,

_debug = function(log) {
    if(typeof console !== "undefined") {
        console.log(log);
    } else if(document.getElementById('debug') !== null) {
        document.getElementById('debug').innerHTML += log + '<br />';
    }
},

_error = function(msg) {
    throw new Error(msg);
},

//Interpreting function
letvar = function(vname, value) {
    variables[vname] = value;
},

getvar = function(vname) {
    return variables[vname] || 0;
};
    return {
        parse: function(code) {
            var error_cnt = 0,
                error_off = new Array(),
                error_la = new Array();

            if((error_cnt = JXG.JessieCode._parse(code, error_off, error_la)) > 0) {
                for(i = 0; i < error_cnt; i++)
                    alert("Parse error near >"  + code.substr( error_off[i], 30 ) + "<, expecting \"" + error_la[i].join() + "\"");
            }
        },
        execute: function( node ) {
            var ret = 0;
    
            if( !node )
                return 0;

_debug(node.type);
_debug(node.value);

            switch( node.type ) {
                case 'node_op':
                    switch( node.value ) {
                        case 'op_none':
                            if( node.children[0] )
                                this.execute( node.children[0] );                    
                            if( node.children[1] )
                                ret = this.execute( node.children[1] );
                            break;
                        case 'op_assign':
_debug(node);
                            letvar( node.children[0], this.execute( node.children[1] ) );
                            break;
                        case 'op_noassign':
                            this.execute(node.children[0]);
                            break;
                        case 'op_if':
                            if( this.execute( node.children[0] ) )
                                this.execute( node.children[1] );
                            break;
                        case 'op_if_else':
                            if( this.execute( node.children[0] ) )
                                this.execute( node.children[1] );
                            else
                                this.execute( node.children[2] );
                            break;
                        case 'op_while':
                            while( this.execute( node.children[0] ) )
                                this.execute( node.children[1] );
                            break;
                        case 'op_for':
                            // todo
                            do
                                this.execute( node.children[0] )
                            while( this.execute( node.children[1] ) );
                            break;
                        case 'op_paramlst':
                            if(node.children[0]) {
                                this.execute(node.children[0]);
                            }
                            if(node.children[1]) {
                                ret = this.execute(node.children[1]);
                                stack.push(ret);
                            }
                            break;
                        case 'op_param':
                            if( node.children[0] ) {
                                ret = this.execute(node.children[0]);
                                stack.push(ret);
                            }
                            break;
                        case 'op_paramdeflst':
                                if(node.children[0]) {
                                this.execute(node.children[0]);
                            }
                            if(node.children[1]) {
                                ret = node.children[1];
                                stack.push(ret);
                            }
                            break;
                        case 'op_paramdef':
                            if( node.children[0] ) {
                                ret = node.children[0];
                                stack.push(ret);
                            }
                            break;
                        case 'op_function':
                            this.execute(node.children[0]);
                            _debug(stack);
// TODO:  PARAMETER HANDLING!
                            ret = function() {
                                this.execute(node.children[1]);
                            }
                            stack = [];
                            break;
                        case 'op_create':
                            _debug('creating a ' + stack[0]);
                            this.execute(node.children[0]);
                            ret = board.create(stack[0], stack.slice(1));
                            stack = [];
                            break;
                        case 'op_use':
                            var found = false;
                            for(var b in JXG.JSXGraph.boards) {
                                if(JXG.JSXGraph.boards[b].container === node.children[0].toString()) {
                                    board = JXG.JSXGraph.boards[b];
                                    found = true;

                                    _debug('now using board ' + board.id);
                                }
                            }
                    
                            if(!found)
                                alert(node.children[0].toString() + ' not found!');
                            break;
                        case 'op_equ':
                            ret = this.execute( node.children[0] ) == this.execute( node.children[1] );
                            break;
                        case 'op_neq':
                            ret = this.execute( node.children[0] ) != this.execute( node.children[1] );
                            break;
                        case 'op_grt':
                            ret = this.execute( node.children[0] ) > this.execute( node.children[1] );
                            break;
                        case 'op_lot':
                            ret = this.execute( node.children[0] ) < this.execute( node.children[1] );
                            break;
                        case 'op_gre':
                            ret = this.execute( node.children[0] ) >= this.execute( node.children[1] );
                            break;
                        case 'op_loe':
                            ret = this.execute( node.children[0] ) <= this.execute( node.children[1] );
                            break;
                        case 'op_add':
                            ret = this.execute( node.children[0] ) + this.execute( node.children[1] );
                            break;
                        case 'op_sub':
                            ret = this.execute( node.children[0] ) - this.execute( node.children[1] );
                            break;
                        case 'op_div':
                            ret = this.execute( node.children[0] ) / this.execute( node.children[1] );
                            break;
                        case 'op_mul':
                            ret = this.execute( node.children[0] ) * this.execute( node.children[1] );
                            break;
                        case 'op_neg':
                            ret = this.execute( node.children[0] ) * -1;
                            break;
                    }
                    break;

                case 'node_var':
                    ret = getvar(node.value);
                    break;

                case 'node_const':
                    ret = Number(node.value);
                    break;

                case 'node_str':
                    ret = node.value;
                    break;
        
                case 'node_method':
                    switch(node.value) {
                        case 'x':
                            if(!JXG.exists(variables[node.children[0]])) {
                                _error(node.children[0] + ' is undefined.');
                                ret = NaN;
                            } else if(!JXG.exists(variables[node.children[0]].X)) {
                                _error(node.children[0] + ' has no property \'X\'.');
                                ret = NaN;
                            } else
                                ret = variables[node.children[0]].X();
                            break;
                        case 'y':
                            if(!JXG.exists(variables[node.children[0]])) {
                                _error(node.children[0] + ' is undefined.');
                                ret = NaN;
                            } else if(!JXG.exists(variables[node.children[0]].Y)) {
                                _error(node.children[0] + ' has no property \'Y\'.');
                                ret = NaN;
                            } else
                                ret = variables[node.children[0]].Y();
                            break;
                    }
                    break;
            }

            return ret;
        },

        /**
         * Create a new parse tree node. Basically the same as node(), but this builds
         * the children part out of an arbitrary number of parameters, instead of one
         * array parameter.
         * @param {String} type Type of node, e.g. node_op, node_var, or node_const
         * @param value The nodes value, e.g. a variables value or a functions body.
         * @param children Arbitrary number of parameters; define the child nodes.
         */
        createNode: function(type, value, children) {
            var n = node(type, value, []),
                i;
    
            for(i = 2; i < arguments.length; i++)
                n.children.push( arguments[i] );

            return n;
        }
    };

})();
