(function(global){

var random = Math.random
var round = Math.round

function Display(width,height){
	
	this.width = width
	this.height = height
	this.grid = new Uint8Array( width*height )
}
Display.prototype.clear = function(){
	
	this.grid.fill(0)
}
Display.prototype.clearValue = function( v ){
	
	this.grid.fill(v)
}
Display.prototype.fillRandom = function( v ){
	
	for(var i = this.grid.length-1; i>= 0; --i){
		
		if(random() < 0.5) this.grid[i] = v || 1
	}
}
Display.prototype.setPixel = function( x, y, v ){
	
	x = round(x)
	y = round(y)
	v = v || 0
	
	if(x >= 0 && 
	   y >= 0 && 
	   x < this.width && 
	   y < this.height   
	  ) this.grid[ x + y * this.width ] = v
}
Display.prototype.getPixel = function( x, y){
	
	return this.grid[ x + y * this.width ]
}
Display.prototype.clearPixel = function( x, y ){
	
	this.grid[x + y * this.width ] = 0
}

Display.prototype.draw = function( ctx, size,  color ){
	
	var w = this.width

	
	ctx.fillStyle = color || 'black'
	
	ctx.beginPath()
	
	for(var y = this.height - 1; y >= 0; --y){
		for(var x = w - 1; x >= 0; --x){
			
			var i = ( x + y * w)
			
			if( this.grid[i] ){
				
				ctx.rect(  x * size, y * size, size-1,size-1)
				
				
			}
		}
	}
	ctx.fill()
	
}

global.Display = Display
})(this);
