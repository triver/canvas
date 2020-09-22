(function(global){

const HPI = Math.PI/2
function cw(a){
	return [
	a[6],a[3],a[0],
	a[7],a[4],a[1],
	a[8],a[5],a[2]
	
	]
}

function ccw(a){
	return [
	a[2],a[5],a[8],
	a[1],a[4],a[7],
	a[0],a[3],a[6]
	
	]
}
function idx( x,y,z, s){
	
	return  x + s * ( y + z * s )
}
function xyz( i, s){
	
	var x = i % s
	i = i / s | 0
	var y = i % s
	var z = i / s | 0
	
	return [x,y,z] 
}
function normRGB(a){
	
	for(let i=1; i<a.length;i++){
		
		a[i][0] /= 255
		a[i][1] /= 255
		a[i][2] /= 255
	}
	return a
}
const defaultColors =[
	false,
	[185,0,0],
	[0,155,52],
	[0,50,173],
	[255,89,0],
	[255,255,255],
	[255,213,0]
]
function Rubics(size, colors){
	
	size = size || 1
	colors = colors || normRGB( defaultColors )
	
	
	this.X =[]
	this.Y =[]
	this.Z =[]
	this.coords =[]
	this.indexes =[]
	this.rotations =[]
	this.colors = []
	var i=0
	for(var z =0; z < 3; z++ ){

	 this.X[z] = []
	 this.Y[z] = []
	 this.Z[z] = []
	 
		for(var y =0; y < 3;y++){
			for(var x =0; x < 3;x++){
				
				this.Z[z].push( idx( x,y,z, 3) )
				this.Y[z].push( idx( x,z,y, 3) )
				this.X[z].push( idx( z,y,x, 3) )
				
				this.coords.push([ 
					(x  - 1)  * size, 
					(y  - 1)  * size, 
					(z  - 1)  * size 
				])
			
				this.indexes.push(i)
				i++
				
				this.rotations.push( quat.create() )
				
				var front =  z === 2 ? colors[1] : colors[0]
				var right =  x === 2 ? colors[2] : colors[0]
				var back =   z === 0 ? colors[3] : colors[0]
				var left =   x === 0 ? colors[4] : colors[0]
				var top =    y === 2 ? colors[5] : colors[0]
				var bottom = y === 0 ? colors[6] : colors[0]
				
				this.colors.push([front,right,back,left,top,bottom])
				
			}
		}

	}
	
	
}
Rubics.prototype.resetCoords = function(){
	
	this.turnCoords = this.coords.map(function(a){
		return [a[0],a[1],a[2]]
	})
	
}
Rubics.prototype.updateIndexes = function( block, turn ){
	
	for(var i=0;i<turn.length;i++){
		
		this.indexes[ block[i] ] = turn[i]
	}
	
}
Rubics.prototype.getIndexes = function( block ){
	
	var a =[]
	for(var i=0;i<block.length;i++){
		
		a.push( this.indexes[ block[i] ])
		
	}
	return a
}
Rubics.prototype.updateTurn = function( block,  axis, dir ){
	
	
	
	var indexes = this.getIndexes( block ) 
	var turn = dir > 0 ? ccw( indexes ) : cw( indexes )
	this.updateIndexes( block, turn )
	
	
	var q = quat.setAxisAngle([], axis, dir*HPI )
	
	for(var i=0;i< indexes.length;i++){
		
		quat.multiply( this.rotations[ indexes[i] ], q, this.rotations[ indexes[i] ] )
	}
	
	
}

global.Rubics = Rubics

})(this)
