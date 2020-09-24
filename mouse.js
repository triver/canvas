(function(global){

let currentElement=false
let fixedWidth=false

const mouse ={
			
	x:null,
	y:null,
	sx:null,
	sy:null,
	dx:0,
	dy:0,
	lx:0,
	ly:0,
	radius:0,
	ox:0,
	oy:0,
	axis:false,
	down:false,
	state:0,
	update:function(e){
		
	
		if(e.touches && e.touches.length !== 1) return false
	
		var rect = e.currentTarget.getBoundingClientRect()
		
		var event = e.touches && e.touches.length === 1 ? e.touches[0] : e
		
		if(fixedWidth){
			const s = fixedWidth / rect.width
			this.x = (event.clientX - rect.left) * s
			this.y = (event.clientY - rect.top) * s
			
		}else{
	
			this.x = (event.clientX - rect.left) 
			this.y = (event.clientY - rect.top)
		}
	},
	reset:function(){
		
		this.x = null
		this.y = null
		this.sx = null
		this.sy = null
		this.dx = 0
		this.dy = 0
		this.lx = null
		this.ly = null
		this.down = false
		this.axis = null
	},
	onDown:function(){},
	onUp:function(){},
	onMove:function(){},
	onDragX:function(){},
	onDragY:function(){},
	onDragZ:function(){},
	onClick:function(){},
	onWheel:function(){}
}
function onDown(e){
	
	mouse.update(e)
	mouse.sx = mouse.x
	mouse.sy = mouse.y
	mouse.lx = mouse.x
	mouse.ly = mouse.y
	mouse.down = true
	
	const d = Math.sqrt( Math.pow( mouse.x - mouse.ox, 2 ) + Math.pow( mouse.y - mouse.oy, 2 ) )
	
	if( d > mouse.radius ){
		
		mouse.axis = 'z'
		
	}else{
		
		mouse.axis=null
	}
	
	mouse.onDown()
}
function onUp(e){
	
	mouse.update(e)
	
	mouse.dx = mouse.sx - mouse.x
	mouse.dy = mouse.sy - mouse.y
	
	if(Math.abs( mouse.dx ) < 2 && Math.abs( mouse.dy ) < 2){
		
		mouse.onClick( mouse.x, mouse.y, mouse.dx, mouse.dy )
	}
	mouse.onUp()
	mouse.reset()
}
function onMove(e){
	
	e.preventDefault()
	
	if(!mouse.down) return 
	
	mouse.update(e)
	
	mouse.dx = mouse.sx - mouse.x
	mouse.dy = mouse.sy - mouse.y
	
	if(Math.abs( mouse.dx ) < 2 && Math.abs( mouse.dy ) < 2){
		
		return
	}
	
	const dx = mouse.x - mouse.lx
	const dy = mouse.y - mouse.ly
	const dz = Math.sqrt( dx*dx+dy*dy )

	if( mouse.axis === 'z'){
		
		
	
		const dot = ( mouse.y - mouse.oy ) * dx + ( -mouse.x + mouse.ox ) * dy
		mouse.onDragZ( dz*Math.sign( dot ) )
	
		
		
	}else{
		
		if(!mouse.axis){
			
			if( dz > 2){
			
				if( Math.abs(dx) > Math.abs(dy) ) mouse.axis='x'
				else mouse.axis='y'
			}
		}
		
		if( mouse.axis==='x') mouse.onDragX( dx)
		else if( mouse.axis ==='y') mouse.onDragY( dy)
		
		
	}
	
	mouse.onMove( mouse.x, mouse.y, dx, dy)
	
	mouse.lx = mouse.x
	mouse.ly = mouse.y
	
	
	
}
function onWheel(e){
	e.preventDefault()
	mouse.onWheel( Math.sign( e.deltaY ) ) 
}
function resize( element){
	mouse.ox = element.width / 2
	mouse.oy = element.height / 2
	mouse.radius = Math.min( mouse.ox,mouse.oy )
}

let mouseCreated = false

global.Mouse = function(element,width){
	
	if(mouseCreated){
		 throw 'Mouse alredy exists' 
		 return
	 }
	
	mouseCreated = true
	
	fixedWidth = width
	
	if(currentElement) return
	
	currentElement = element
	
	element.addEventListener('mousedown',onDown,false)
	element.addEventListener('mouseup',onUp,false)
	element.addEventListener('mouseleave',onUp,false)
	element.addEventListener('mousemove',onMove,false)
	element.addEventListener('wheel',onWheel,false)
	
	

	if( 'ontouchstart' in window){

		elements.addEventListener('touchstart', onDown, false)
		element.addEventListener('touchmove', onMove, false)
		element.addEventListener('touchcancel', onUp, false)
		element.addEventListener('touchend', onUp, false)
	}
	
	window.addEventListener('resize',e => {
		resize( element)
		
	},false)
	resize( element)
	return mouse
}
})(this);
