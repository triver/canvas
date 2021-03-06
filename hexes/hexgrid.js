(function(global){
	
'use strict'

//CONSTANTS
var SQRT3 = Math.sqrt(3)
var SQRT32 = SQRT3 / 2
var SQRT33 = SQRT3 / 3
var PI2 = Math.PI * 2
var PI2_6 = PI2 / 6
var TWO_THIRDS = 2 / 3
var ONE_THIRD = 1 / 3
var THREE_OVER_TWO = 3 / 2
var EPSILON = 0.0000001

//skip Math
var round = Math.round
var abs = Math.abs
var cos = Math.cos
var sin = Math.sin
var random = Math.random
var max = Math.max
var min = Math.min

var DIRECTIONS = [
   [ 1, -1,  0], [ 1,  0, -1], [ 0,  1, -1],
   [-1,  1,  0], [-1,  0,  1], [ 0, -1,  1]
]
var DIAGONALS =[
   [2, -1, -1], [ 1, 1, -2],[-1, 2, -1], 
   [-2,  1,  1], [-1, -1, 2],[ 1, -2, 1]
]



function Heap() {
	
	if (!BinaryHeap) throw new Error("BinaryHeap was not found.")
	
	return new BinaryHeap( function (node) {
		return node.F
	})
}
//NODE
function Node(hex, parent, g, h) {
	
	this.hex = hex
	this.parent = null
	this.G = null
	this.H = null
	this.F = null
	this.rescore(parent, g, h)
}

Node.prototype.rescore = function (parent, g, h) {
	this.parent = parent
	this.G = g
	this.H = h || 0
	this.F = this.G + this.H
}

//POINT
function Point( x, y){
	this.x = x;
	this.y = y;
}

function getHexPoints( radius ){
		
	
	var points =[]
	
	for(var i = 0; i < 6; i++){
		
		var a = i * PI2_6
		var x =  cos(a) * radius
		var y =  sin(a) * radius
		
		points.push(new Point(x,y) )
	}
	
	return points
}	

//HEX
function Hex( x, y, z){
	
	
	this.x = x || 0
	this.y = y || 0
	this.z = z || -this.x - this.y
	
	if (round(this.x + this.y + this.z) !== 0) throw "x + y + z must equal 0"

}
Hex.prototype.clone = function(){
	
	var hex = new Hex()
	
	for(var p in this){
		if( this.hasOwnProperty( p ) ){
			hex[p] = this[p]
		}
		
	}
	return hex
}
Hex.prototype.copy = function(other){
	
	for(var p in other)
		if( this.hasOwnProperty( p ) )
			this[p] = other[p]
	
	return this
}
Hex.prototype.add = function(other){
	
	this.x += other.x 
	this.y += other.y 
	this.z += other.z
	return this
}
Hex.prototype.subtract = function(other){
	
	this.x -= other.x
	this.y -= other.y
	this.z -= other.z
	return this
}
Hex.prototype.scale = function(s){
	
	this.x *= s
	this.y *= s
	this.z *= s
	return this
}
Hex.prototype.rotateLeft = function(){
	
	var x = this.x, y = this.y,z = this.z
	this.x = -y 
	this.y = -z
	this.z = -x
	return this
}
Hex.prototype.rotateRight = function(){
	
	var x = this.x, y = this.y, z = this.z
	this.x = -z 
	this.y = -x
	this.z = -y
	return this
}
Hex.prototype.step = function(i){
	
	this.x += DIRECTIONS[i][0];
	this.y += DIRECTIONS[i][1];
	this.z += DIRECTIONS[i][2];
	
	return this
}
Hex.prototype.stepDiagonal = function(i){
	
	this.x += DIAGONALS[i][0];
	this.y += DIAGONALS[i][1];
	this.z += DIAGONALS[i][2];
	
	return this
}
Hex.prototype.moveDiagonal = function(i,s){
	
	return this.stepDiagonal(i).scale( s )
}
Hex.prototype.move = function(i,s){
	
	return this.step(i).scale( s )
}
Hex.prototype.length = function (){
	
    return ( abs(this.x) + abs(this.y) + abs(this.z) ) / 2;
}

Hex.prototype.distanceTo = function ( other )
{
    return max( abs(this.x - other.x), abs(this.y - other.y), abs(this.z - other.z) )
}
Hex.prototype.equals = function( x, y, z ){
	
	if( x instanceof Hex ){
		
		var _x = x.x , _y = x.y , _z = x.z
	}
	else
	{
		var _x = x , _y = y , _z = z || -x-y;
	}
	return  (this.x === _x && this.y === _y && this.z === _z )
}
Hex.prototype.round = function() {
	var cx = this.x, 
		cy = this.y,
		cz = this.z;
	
	this.x = round(cx);
	this.y = round(cy);
	this.z = round(cz);

	var dx = abs(this.x - cx),
		dy = abs(this.y - cy),
		dz = abs(this.z - cz);

	if ( dx > dy && dx > dz )
		this.x = -this.y -this.z;
	else if ( dy > dz )
		this.y = -this.x -this.z;
	else
		this.z = -this.x -this.y;
	
	return this;
}
Hex.prototype.lerp = function(other, t)
{
    return new Hex(
		this.x * (1 - t) + other.x * t, 
		this.y * (1 - t) + other.y * t, 
		this.z * (1 - t) + other.z * t).round();
}	

Hex.prototype.getKey = function () {
	return this.x + '_' + this.y;
}
Hex.prototype.toPoint = function (s) {
	s = s || 1
	var x = ( THREE_OVER_TWO * this.x ) * s
	var y = ( SQRT32 * this.x  +  SQRT3 * this.y) * s
	return new Point(x,y)
}

//GRID

function Grid( radius, size, cx, cy ){
	
	//hex cell side length
	this.size = size || 1
	
	//grid origin
	this.originX = cx || 0
	this.originY = cy || 0
	
	//grid radius in hexes
	this.radius = radius || 1
	
	
	this.hexes =[]
	this.ref ={}
	
	for (var x = -radius; x <= radius; x++){
		
		for (var y = max(-radius, -x - radius), l = min(radius, -x + radius); y <= l; y++){
			
			var z = -x - y
			var hex = new Hex(x,y,z) 
			
			hex.cost=1
			hex.value=0
			hex.blocked = 0
			hex.center = hex.toPoint( this.size )
			
			this.hexes.push( hex )
			this.ref[ hex.getKey() ] = hex
		}
	}
	
	this.length = this.hexes.length
	this.dummy = getHexPoints( this.size )
	
}

Grid.prototype.getHex = function( x, y ){

	return this.ref[ x+'_'+y ]
	
}

Grid.prototype.getHexAtPoint = function( px, py){
	
	var x = px * TWO_THIRDS / this.size
	
	var y = (-ONE_THIRD * px + SQRT33 * py ) / this.size

	
	var hex = new Hex( x, y, -x - y ).round()

	return this.ref[ hex.getKey()]
	
}

Grid.prototype.getNeighbors = function(a) {

	var neighbors = [], 
		directions = DIRECTIONS,
		i,dir,hex
	
	for(i=0; i<6;i++){
		
		dir = directions[i]
		
		hex = this.getHex( a.x + dir[0], a.y + dir[1] )
		
		if (hex) neighbors.push(hex);
	}
	
	return neighbors;
	
}
Grid.prototype.getDiagonalNeighbors = function(a) {
	
	var neighbors = [], 
		diagonals = DIAGONALS,
		l=diagonals.length,
		i,dia,hex
	
	for(i=0; i<l;i++){
		
		dia = diagonals[i]
		
		hex = this.getHex( a.x + dia[0], a.y + dia[1] )
		
		if (hex) neighbors.push(hex)
	}
	
	return neighbors;
	
}
Grid.prototype.getCircle = function( hex, n, dir) {
	
	
	dir = dir || 4
	
	var hexes = [], cur = new Hex().move( dir,  n ), i, j
	
	for( i = 0; i < 6; i++ ){
		for( j = 0; j < n; j++ ){
			
			var h = this.getHex( cur.x + hex.x, cur.y + hex.y )
			
			if(h) hexes.push( h )
			
			cur = cur.step( i )
		}
	}
	
	return hexes
}
Grid.prototype.getRange = function( hex , n) {
	
	
	
	var hexes = []
	
	for (var x = -n; x <= n; x++){
		
		for (var y = max(-n, -x - n); y <= min(n, -x + n); y++){
			
			var h = this.getHex( x + hex.x, y + hex.y )
			
			if(h) hexes.push( h )
		}
	}
	return hexes
}

Grid.prototype.getLine = function( a, b) {
	
	var n = a.distanceTo( b ),
		hexes=[b],
		i,r,
		step = 1.0 / max(n, 1)
	
	var an = new Hex( a.x + EPSILON, a.y + EPSILON, a.z - EPSILON )
	var bn = new Hex( b.x + EPSILON, b.y + EPSILON, b.z - EPSILON )
	
	for(i=0; i < n;i++){
		
		r = an.lerp( bn, step * i)
		
		hexes.push( this.getHex( r.x, r.y, r.z )  )
	}
	return hexes
}

Grid.prototype.findPath = function (start, end) {
	
	var grid = this,
		heap = Heap(),
		closedHexes = {},
		visitedNodes = {}
	
	heap.push( new Node( start, null, 0, start.distanceTo( end )  ) )
	
	while( heap.size() > 0 ) {
		
		
		var current = heap.pop()
		
		
		if ( current.hex.equals( end ) ) {
			
			var path = []
			
			while(current.parent) {
				
				path.push( current )
				current = current.parent
			}
			
			
			return path.map(function(x) { return x.hex }).reverse()
		}
		
	
		closedHexes[ current.hex.getKey() ] = current
		
		
		var neighbors = grid.getNeighbors( current.hex )
		
		neighbors.forEach(function(n) {
			
		
			if ( n.blocked || closedHexes[ n.getKey() ] ) return
			
			
			var g = current.G + n.cost,
				visited = visitedNodes[ n.getKey() ]
			
			
			if (!visited || g < visited.G) {
				
				var h = n.distanceTo( end)
				
				if (!visited) {
					
					var nNode = new Node(n, current, g, h)
					closedHexes[ nNode.hex.getKey() ] = nNode
					heap.push( nNode )
					
				} else {
					
					
					visited.rescore( current, g, h )
					heap.rescoreElement( visited )
				}
			}
		})
	}

	return []
}
Grid.prototype.getLineOfSight = function (start, end) {
	
	
	if (start.equals( end ) ) return []
	
	var N = start.distanceTo( end),
		line1 = [],
		line2 = [],
		cStart = start.clone(),
		cEnd1 = end.clone(),
		cEnd2 = end.clone(),
		step = 1.0 / max( N, 1);
	
	
	cEnd1.x -= EPSILON 
	cEnd1.y -= EPSILON 
	cEnd1.z += EPSILON
	
	cEnd2.x += EPSILON 
	cEnd2.y += EPSILON 
	cEnd2.z -= EPSILON
	
	for (var i = 0; i <= N; i++) {
		
		var pos = cStart.lerp( cEnd1, step * i)
		
		var hex = this.getHex( pos.x, pos.y )
		
		if (!start.equals(hex)) {
			
			if (!hex.blocked) {
				
				line1.push(hex)
				
			} else break
		}
	}

	for (var i = 0; i <= N; i++) {
		var pos = cStart.lerp( cEnd2, step * i);
		
		var hex = this.getHex(pos.x, pos.y)
		
		if (!start.equals(hex)) {
			
			if (!hex.blocked) {
				
				line2.push(hex)
				
			} else break
		}
	}
	
	return (line1.length < line2.length) ? line1 : line2;
}


//canvas draw functions
Grid.prototype.draw = function( ctx, color ){
	
	ctx.beginPath()
	
	
	for(var i=0; i<this.hexes.length;i++){
		
		var c = this.hexes[i].center
		var p = this.dummy[0]
		
		ctx.moveTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
		
		for(var j=1; j < this.dummy.length;j++){
			
			p = this.dummy[j]
			ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
			
		}
		
		p = this.dummy[0]
		
		ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
	}
	
	ctx.strokeStyle = color || '#000000'
	ctx.stroke()
}
Grid.prototype.drawBlocked = function( ctx, color ){
	
	ctx.beginPath()
	
	
	for(var i=0; i<this.hexes.length;i++){
		
		if( !this.hexes[i].blocked) continue
		
		var c = this.hexes[i].center
		var p = this.dummy[0]
		
		ctx.moveTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
		
		for(var j=1; j < this.dummy.length;j++){
			
			p = this.dummy[j]
			ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
			
		}
		
		p = this.dummy[0]
		
		ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
	}
	
	ctx.fillStyle = color || '#000000'
	ctx.fill()
}
Grid.prototype.drawCoords= function( ctx, color ){
	
	for(var i=0; i < this.hexes.length; i++ ){
		
		var hex = this.hexes[i]
		var p = hex.toPoint( this.size )
	
		ctx.fillStyle = color || '#000000'
		ctx.fillText( hex.x+'  '+hex.y+'  '+hex.z, this.originX + p.x - 16,this.originY +  p.y + 4  )
	}
	
}

Grid.prototype.drawHex = function( ctx, hex, fill, stroke ){
	
	var c = hex.center
	var p = this.dummy[0]
	
	ctx.beginPath()
	ctx.moveTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
	
	for(var j=1; j < this.dummy.length;j++){
		
		p = this.dummy[j]
		ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
		
	}
	
	p = this.dummy[0]
	
	ctx.lineTo( this.originX + c.x + p.x, this.originY + c.y + p.y)
	
	if(fill){
		ctx.fillStyle = fill
		ctx.fill()
	}
	if(stroke){
		ctx.strokeStyle = stroke
		ctx.stroke()
	}
	
}
Grid.prototype.drawHexArray = function( ctx, hexes, fill , stroke){
	
	for(var i=0; i< hexes.length;i++){
		
		var fillColor = Array.isArray( fill ) ? fill[i % fill.length ] : fill
		var strokeColor = Array.isArray( stroke ) ? stroke[i % stroke.length ] : stroke
		
		this.drawHex( ctx, hexes[i], fillColor, strokeColor)
	}
	
}

/*END*/

global.Hex = Hex
global.Grid = Grid

})(this)



