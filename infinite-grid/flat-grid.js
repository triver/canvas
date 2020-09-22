(function(global){

var SQRT3 = Math.sqrt(3)
var SQRT33 = SQRT3 / 3
var SQRT32 = SQRT3 / 2
var ONE_THIRD = 1 / 3
var TWO_THIRDS = 2 / 3
var THREE_FOURTHS = 3 / 4
var THREE_OVER_TWO = 3 / 2

function flatten(v){
			
	var a=[]
	
	for(var i=0; i<v.length; i++){
		
		for(var j=0; j< v[i].length; j++){
			
			a.push( v[i][j] )
		}
		
	}
	
	return a
}

//AXIAL
function Axial( x, y ){
	
	this.x = x
	this.y = y
}

Axial.prototype.toCube = function() {
	
	return new Cube(this.x, -this.x - this.y, this.y)
}
Axial.prototype.equals = function(other) {
	return (this.x == other.x && this.y == other.y)
}

//CUBE
function Cube( x, y , z){
	this.x = x
	this.y = y
	this.z = z
}
Cube.prototype.toAxial = function(other) {
	
	return new Axial( this.x, this.z)
}
Cube.prototype.rotateLeft = function(){
	
	var x = this.x, y = this.y,z = this.z
	this.x = -y 
	this.y = -z
	this.z = -x
	return this
}
Cube.prototype.rotateRight = function(){
	
	var x = this.x, y = this.y, z = this.z
	this.x = -z 
	this.y = -x
	this.z = -y
	return this
}
Cube.prototype.round = function () {
	var cx = this.x, 
		cy = this.y,
		cz = this.z

	this.x = Math.round(cx)
	this.y = Math.round(cy)
	this.z = Math.round(cz)

	var x_diff = Math.abs(this.x - cx),
		y_diff = Math.abs(this.y - cy),
		z_diff = Math.abs(this.z - cz)

	if (x_diff > y_diff && x_diff > z_diff)
		this.x = -this.y -this.z
	else if (y_diff > z_diff)
		this.y = -this.x -this.z
	else
		this.z = -this.x -this.y

	return this
}

//HEX
function Hex( axial, point, index){
	
	this.x = axial.x
	this.y = axial.y
	this.point = point
	this.index = index
}
//inherit axial functions
Hex.prototype = Axial.prototype



var Grid = function (radius, size , fit) {
	
	
	if( fit) this.textureSize = size / 2
	else this.textureSize = 1
	
	radius = radius || 1
	size = size || 1
	
	
	if( !!fit ){
	
		var r = size / ( radius * 2 + 1 ) * 0.5
	
		size = r / SQRT32
		
		
	}
	
	this.hexes = []
	
	//grid radius in hexagons
	this.radius = radius 
	
	//hexagon side length
	this.size = size
	
	//hexagon width and height
	this.width = size * 2;
	this.height = SQRT32 * this.width
	
	this.worldRadius = (this.height*this.radius-1)
	this.worldRadiusSq = this.worldRadius*this.worldRadius
	var count = 0
	
	for (var x = -radius; x <= radius; x++){
		for (var y = -radius; y <= radius; y++){
			for (var z = -radius; z <= radius; z++){
				
				if (x + y + z == 0){
					
					var a = new Axial( x, y )
					
					var c = a.toCube()
					var px = c.x * this.width * THREE_FOURTHS
					var py = ( c.z + c.x / 2) * this.height
					
					this.hexes.push( new Hex( a ,[ px, py ], count ) )
					
					count++
					
				}
			}
		}
	}
	
	this.mesh = this.generateMesh()
	this.centers = this.getCenters()
}
Grid.prototype.generateMesh = function( ){
	
	const v = []
	const t = []
	const f = []
	
	const check = {}
	const precision = 1000000
	const angle = Math.PI*2/6
	const size = this.size
	const texSize = this.textureSize
	const color = []
	const cm = 0.6
	const splx = new SimplexNoise()
	for(let i =0; i< this.hexes.length; i++){
		
		const hex = this.hexes[i]
		const center = hex.point
		
		//center index
		const ci = v.length
		
		//push center
		v.push( [ center[0], 0, -center[1] ] )
		const noise = splx.noise(center[0],center[1])*0.5+0.5
		color.push(0.0,noise*0.8, noise)
		
		const tx =  center[0] / texSize * 0.5 + 0.5
		const ty =  -center[1] / texSize * 0.5 + 0.5 
		
		t.push( tx, ty )
		
		hex.texcoord = [tx, ty] 
		
		//no need to check key ???
		const ff = []
		
		for(let j=0; j<6;j++){
			
			const theta = j*angle
			
			const x = center[0] + Math.cos( theta ) * size
			const y = center[1] + Math.sin( theta ) * size 
			
		
			var keyX = x * precision | 0
			var keyY = y * precision | 0
			
			var key = Math.min( keyX, keyY)+'_'+Math.max( keyX, keyY)
			
		
			if( !check.hasOwnProperty(key)){
				
				var index =  v.length
				
				check[key] = index
				
				v.push( [ x,  0, -y ] )
				color.push(1.0,1.0,1.0)
				t.push(
					  x / texSize * 0.5 + 0.5, 
					  -y / texSize * 0.5 + 0.5
				)
				
				ff.push(index)
				
			}
			else{
				
				ff.push( check[key] )
			}
			
			
		}
		
		for(let k=0; k<ff.length;k++){
			
			const ai = ff[k]
			const bi = ff[ (k + 1) % ff.length]
			
			f.push( ai, bi, ci )
			
		}
	}
	
	return {
		position:  flatten( v ) ,
		texcoord:  t ,
		color:color,
		indices: f
	}
	
}
Grid.prototype.getHexAt = function( hex ){
	
	for( var i=0; i<this.hexes.length;i++){
		
		var some = this.hexes[i]
		
		if( hex.equals( some ) )
			return some
	}
	return false
}
Grid.prototype.getHexAtPoint = function( px, py){
	
	var x = px * TWO_THIRDS / this.size;
	var y = (-px / 3 + SQRT33 * py) / this.size
	
	var hex = new Axial(x, y).toCube().round().toAxial()

	return this.getHexAt( hex )
	
}
Grid.prototype.pointToHex = function( px, py ){
	
	
	var x = px * TWO_THIRDS / this.size;
	var y = (-px / 3 + SQRT33 * py) / this.size
	
	var a = new Axial(x, y).toCube().round().toAxial()
	var c = a.toCube()
	var xx = c.x * this.width * THREE_FOURTHS
	var yy = ( c.z + c.x / 2) * this.height
					
			
	return new Hex( a ,[xx,yy], false )
	
}
Grid.prototype.hexToPoint = function( hex ){
	
	var x = ( THREE_OVER_TWO * hex.x ) * this.size
	var y = ( SQRT32 * hex.x  +  SQRT3 * hex.y) * this.size
	
	return [ x, y]
	
}
Grid.prototype.getCenters = function(  ){
	
	var N = this.radius
	
	var centers=[[0,0,0]]
	var a = new Axial(-N,-N-1)
	var c = a.toCube()
	
	var px = c.x * this.width * THREE_FOURTHS
	var py = ( c.z + c.x / 2) * this.height
	
	centers.push([px,0,py])
	
	for(var i=0;i<5;i++){
		c.rotateRight()
		px = c.x * this.width * THREE_FOURTHS
		py = ( c.z + c.x / 2) * this.height
		centers.push([px,0,py])
	}
	return centers
}

global.FlatGrid = Grid


})(this);
