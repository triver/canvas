

function UnionFind(count) {
	
  this.roots = new Array(count)
  this.ranks = new Array(count)
  
  for(var i=0; i<count; ++i) {
	  
    this.roots[i] = i
    this.ranks[i] = 0
  }
}

UnionFind.prototype.makeSet = function(){
  var n = this.roots.length
  this.roots.push(n)
  this.ranks.push(0)
  return n
}

UnionFind.prototype.find = function(x){
  var x0 = x
  var roots = this.roots
  while(roots[x] !== x) {
    x = roots[x]
  }
  while(roots[x0] !== x) {
    var y = roots[x0]
    roots[x0] = x
    x0 = y
  }
  return x
}

UnionFind.prototype.link = function(x, y){
  var xr = this.find(x)
  var yr = this.find(y)
  
  if(xr === yr) {
    return
  }
  var ranks = this.ranks,
	  roots = this.roots,
      xd    = ranks[xr],
      yd    = ranks[yr]
    
  if(xd < yd) {
    roots[xr] = yr
  } else if(yd < xd) {
    roots[yr] = xr
  } else {
    roots[yr] = xr
    ++ranks[xr]
  }
}


// vertices hold data that will be used in the distance 'metric' function
// edges holds position in vertices list

function Kruskal( vertices, edges, metric ){
	
  var set = {}

  var finalEdge = []

  var forest = new UnionFind( vertices.length )

  var edgeDist = []
  
  for (var ind in edges)
  {
	var u = edges[ind][0]
	var v = edges[ind][1]
	var e = { edge: edges[ind], weight: metric( vertices[u], vertices[v] ) }
	
	edgeDist.push(e)
  }

  edgeDist.sort( function(a, b) { return a.weight- b.weight; } )

  for (var i=0; i<edgeDist.length; i++)
  {
	var u = edgeDist[i].edge[0]
	var v = edgeDist[i].edge[1]

	if ( forest.find(u) != forest.find(v) )
	{
	  finalEdge.push( [ u, v ] )
	  forest.link( u, v )
	}
  }

  return finalEdge
  
  

}





