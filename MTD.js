/*
    MTD(f)
    - really fast minimax
    
    Thanks to:
        http://en.wikipedia.org/wiki/MTD-f
        http://people.csail.mit.edu/plaat/mtdf.html
        http://www.chessbin.com/post/transposition-table-and-zobrist-hashing.aspx
*/

// not the best transposition table...
var transpositionTable = [];
var nodeType = {};

// MTD(root, 0, depth)
function MTD(root:node_type, f:integer, d:integer):integer;
{
    var g = f;
    var upperbound = +Infinity;
    var lowerbound = -Infinity;
    var beta;
    
    do {
        if (g == lowerbound){
            beta = g + 1;
        } else {
            beta = g;
        }
        
        g = AlphaBetaWithMemory(root, beta - 1, beta, d);
        
        if (g < beta){
            upperbound = g
        } else {
            lowerbound = g;
        }
    } while(lowerbound >= upperbound);
    
    return g;
}

function AlphaBetaWithMemory(n:node_type, alpha, beta, d:integer):integer;
{
    /* Transposition table lookup */
    if (retrieve(n) !== false){
        if (n.lowerbound >= beta){
            return n.lowerbound;
        }
        
        if (n.upperbound <= alpha){
            return n.upperbound;
        }
        
        alpha = Math.max(alpha, n.lowerbound);
        beta = Math.min(beta, n.upperbound);
    }
    
    if (d == 0){
        // leaf node
        g = evaluate(n); 
    
    } else if (n.type == MAXNODE){
        // save original alpha value
        g = -Infinity;
        a = alpha;
        c = firstchild(n);
        
        while (g < beta && c != NOCHILD){
            g = Math.max(g, AlphaBetaWithMemory(c, a, beta, d - 1));
            a = Math.max(a, g);
            c = nextbrother(c);
        }

    } else {
        // n is a MINNODE
        g = +Infinity;
        b = beta; // save original beta value
        c = firstchild(n);

        while (g > alpha && c != NOCHILD){
            g = Math.min(g, AlphaBetaWithMemory(c, alpha, b, d - 1));
            b = Math.min(b, g);
            c = nextbrother(c);
        }
    }
    
    // Traditional transposition table storing of bounds
    // Fail low result implies an upper bound
    if (g <= alpha){
        n.upperbound = g;
        //store n.upperbound;
        store(n);
    }
    
    /* Found an accurate minimax value - will not occur if called with zero window */
    if (g >  alpha && g < beta){
        n.lowerbound = g;
        n.upperbound = g;
        //store n.lowerbound
        //store n.upperbound;
        store(n);
    }
    
    /* Fail high result implies a lower bound */
    if (g >= beta){
        n.lowerbound = g;
        //store n.lowerbound;
        store(n);
    }
    
    return g; 
}

function retrieve(node)
{
    var hash = hashNode(node);
    
    if(transpositionTable[node.hash] == undefined){
        return false;
    }
    
    return transpositionTable[node.hash];
}

function store(node)
{
    transpositionTable[node.hash] = node;
}

function evaluate(node)
{
    return node.score;
}

function createNode()
{
    var node = new Object();

    node.hash = generateUUID();    
    node.children = [];
    node.lowerbound = -Infinity;
    node.upperbound = +Infinity;
    node.score = 0;
    node.depth = 0;
    node.type = 
    
    return node;
}

function generateUUID()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};




















