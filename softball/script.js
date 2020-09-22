"use strict"

var vec3 = glMatrix.vec3
var mat4 = glMatrix.mat4
var quat = glMatrix.quat

let rightDown = false
let leftDown = false
let upDown = false
let downDown = false



var HPI = Math.PI / 2
var QPI = Math.PI / 4
var PI = Math.PI
var TWOPI = Math.PI * 2


var width = 600
var height = 600

var cx = width / 2
var cy = height / 2
var scale  = width / 2



var canvas = document.getElementById('canvas')
var trace = document.getElementById('trace')


var ctx = canvas.getContext('2d')

canvas.width = width
canvas.height = height

ctx.strokeStyle ='#111'
ctx.fillStyle = '#000'
ctx.lineWidth = 2
ctx.lineJoin ='round'
ctx.lineCap ='round'

var stick ={
	origin: new Vec2(500,500),
	pos: new Vec2(500,500),
	radius: 30,
	maxRadius: 60,
	dir:new Vec2(),
	active: false,
	forward:new Vec2(0,1),
	backward:new Vec2(0,-1),
	draw: function(ctx){
		
		
		if(!this.active){ 
			
			this.pos.copy(this.origin)
			this.dir.multiplyScalar(0.8)
		}
		else{
			 this.dir = this.pos.clone().sub( this.origin )
			 
			 if( this.dir.lengthSq() > this.maxRadius*this.maxRadius){
				 this.dir.clampLength( this.maxRadius )
			 }
		 }
		var pos = this.origin.clone().add( this.dir)
		ctx.fillStyle = 'orange'
		ctx.strokeStyle = 'orange'
		
		ctx.moveTo( this.origin.x, this.origin.y)
		ctx.beginPath()
		ctx.arc(this.origin.x, this.origin.y,this.radius,0,Math.PI*2)
		ctx.moveTo( this.origin.x, this.origin.y)
		ctx.lineTo( pos.x, pos.y)
		ctx.stroke()
		/*
		ctx.moveTo( this.origin.x, this.origin.y)
		ctx.beginPath()
		ctx.arc(this.origin.x, this.origin.y,this.maxRadius,0,Math.PI*2)
		ctx.stroke()
		*/
		
		
		ctx.moveTo( pos.x, pos.y)
		ctx.beginPath()
		ctx.arc(pos.x, pos.y,this.radius,0,Math.PI*2)
		ctx.fill()
	}
}

var mouse = {
	
	
	pos: new Vec2(),
	lastPos: new Vec2(),
	startPos:new Vec2(),
	delta: new Vec2(),
	direction: new Vec2(),
	down: false,
	target: null,
	targetOffset: new Vec2(),
	targetActive: false,
	update: function(e,w){
		
		if(e.touches && e.touches.length !== 1) return false
	
		var rect = e.target.getBoundingClientRect()
		
		var event = e.touches && e.touches.length === 1 ? e.touches[0] : e;
		
		var scale =  w / rect.width
		
		var x = ( event.clientX - rect.left ) * scale 
		var y = ( event.clientY - rect.top ) * scale
		
		this.pos.set( x,y)
		
	}
}
mouse.target = stick

//functions for frustum culling grid

function classifyPoint( plane, pt ){

	const d = plane[0]*pt[0] + plane[1]*pt[1] + plane[2]*pt[2] + plane[3]
	
	if (d >= 0) return true
 
	return false
}

function normalizePlane(plane){
	
	const mag = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2])
	 plane[0] /= mag
	 plane[1] /= mag
	 plane[2] /= mag
	 plane[3] /= mag
}
function setFrustumPlanes(m,planes){

	planes = planes || [[],[],[],[],[],[]]
	
	//left
	planes[0][0] = m[3]  +  m[0]
	planes[0][1] = m[7]  +  m[4]
	planes[0][2] = m[11] +  m[8]
	planes[0][3] = m[15] + m[12]
	
	//right
	planes[1][0] = m[3]  -  m[0]
	planes[1][1] = m[7]  -  m[4]
	planes[1][2] = m[11] -  m[8]
	planes[1][3] = m[15] - m[12]
	
	//top
	planes[2][0] = m[3]  +  m[1]
	planes[2][1] = m[7]  +  m[5]
	planes[2][2] = m[11] +  m[9]
	planes[2][3] = m[15] + m[13]
	
	//bottom
	planes[3][0] = m[3]  -  m[1]
	planes[3][1] = m[7]  -  m[5]
	planes[3][2] = m[11] -  m[9]
	planes[3][3] = m[15] - m[13]
	
	//near
	planes[4][0] = m[3]  +  m[2]
	planes[4][1] = m[7]  +  m[6]
	planes[4][2] = m[11] + m[10]
	planes[4][3] = m[15] + m[14]
	
	//far
	planes[5][0] = m[3]  -  m[2]
	planes[5][1] = m[7]  -  m[6]
	planes[5][2] = m[11] - m[10]
	planes[5][3] = m[15] - m[14]
	/*
	for(let i=0;i<6;i++){
		normalizePlane( planes[i] )
	}
	*/
	return planes
 
 }

 function pointInFrustum(planes,point){
	 
	 for(let i=0;i<6;i++){
		 
		 const vtest = classifyPoint( planes[i], point )
		
		 if( !vtest ) return false
	 }
	 
	 return true
 }
 

var planes = [[],[],[],[],[],[]]

function createGridFaces( size, s ){
	
	var v = [], f=[], e=[],count=0
	
	var odd = (size & 1), flag = 0
	for( var i=0; i <= size; i++){
		for(var j=0;j <= size; j++){
			
			v.push( [ (j/size - 0.5) *size*s, 0, -(i/size - 0.5)*size*s])
			
			
			if(i<size && j<size){
				
				var a = [count,count+size+1,count+size+2,count+1]
				
				a.odd = flag
				a.index = count
				f.push(a)
			}
			flag = 1 - flag
			count++
		}
		
		if(odd) flag = 1 - flag
	}
	
	return {
		
		vertices: v, 
		faces: f
		 
	}
	
}

function drawGridEdges( ctx, g, edges, m ,color){
	
	setFrustumPlanes( m,planes)
	
	var i,j,k,vec
	var verts = []
	
	for(i=0; i< g.vertices.length;i++){
		
		vec = vec3.copy( [], g.vertices[i] )
		vec.inside = pointInFrustum(planes,g.vertices[i]) 
		vec3.transformMat4( vec, vec, m )
		verts.push( vec)
		
		
	}
	
	ctx.strokeStyle = color || 'orange'
	
	ctx.beginPath()
	for(i=0; i< edges.length;i++){
		
		
		var a = verts [ edges[i][0] ]
		var b = verts [ edges[i][1] ]
		
		if( !a.inside && !b.inside) continue
		
		ctx.moveTo( cx + a[0] * scale, cy - a[1] * scale ) 
		ctx.lineTo( cx + b[0] * scale, cy - b[1] * scale ) 
		
	}
	ctx.stroke()
	
	
}
//helpers
function extractEdges(faces){

	var edges = []
	var check = []
	var i,j,l,l2,min,max,a,b,key,face
	
	for( i=0,l=faces.length; i< l;i++){
		
		face = faces[i]
		
		for(j=0,l2=face.length;j< l2;j++){
			
			a = face[j]
			b = face[ (j + 1) % l2]
			min = Math.min( a, b )
			max = Math.max( a ,b)
			key = min+'_'+max
			
			if( check.indexOf(key) === -1){
				edges.push([a,b])
				check.push(key);
			}
		}
	}
	
	return edges
}


function clamp(num, min, max) {
	return num < min ? min : (num > max ? max : num);
}

function dist3(p1,p2){
	
	var dx = p1[0] - p2[0]
	var dy = p1[1] - p2[1]
	var dz = p1[2] - p2[2]
	
	return (dx*dx + dy*dy + dz*dz)
	
}
function clockwise(points) {
	var a = 0
	var i = 0, j = 0
	for (i = 0; i < points.length; i++) {
		j = i + 1;
		if (j == points.length) j = 0;
		a += points[i][0] * points[j][1] - points[i][1] * points[j][0]
	}
	return a < 0.00001
}
function shadeRGB(color, percent) {
	var t=percent<0?0:255,
		p=percent<0?percent*-1:percent,
		R=color[0],
		G=color[1],
		B=color[2]
		
	return [ Math.round((t-R)*p)+R,Math.round((t-G)*p)+G, Math.round((t-B)*p)+B ]
}
function center(f,verts){
	
	var x=0,y=0,z=0,l=f.length
	
	for(var i=0;i<l;i++){
		
		var v=verts[ f[i] ]
		x += v[0]
		y += v[1]
		z += v[2]
	}
	
	return [ x / l, y / l, z / l ]
	
}
function sortByDistance( faces, verts, pos){
	
	faces.sort(function(a,b){
		var ca = center(a,verts)
		var cb = center(b,verts)
		
		return dist3( cb, pos ) - dist3( ca, pos )
	})
		
	
}
function intersectRayPlane( planeN, rayP, rayD, d){
	
	var s = (rayD[2] * planeN[2] + rayD[1] * planeN[1] + rayD[0] * planeN[0])
	
	if( s === 0) return false 
	
	var t = ( d - (rayP[2] * planeN[2] + rayP[1] * planeN[1] + rayP[0] * planeN[0] ) ) / s
	
	if( t < 0 ) return false
	
	return vec3.add([], rayP, vec3.scale([],rayD,t) )
}

// verlet vertex
function Vertex( x, y, z, pin) {
	
	this.pos = vec3.fromValues( x, y, z )
	this.oldPos = vec3.fromValues( x, y, z )
	this.pin = !!pin
	
}
Vertex.prototype.integrate = function( gravity, viscosity) {
	
	
	var velocity = vec3.create()
	
	vec3.sub( velocity, this.pos, this.oldPos )
	
	vec3.scale( velocity, velocity, viscosity)
	
	vec3.copy( this.oldPos, this.pos )
	
	var force = vec3.create()
	
	vec3.add( force, velocity, gravity )
	
	
	vec3.add( this.pos, this.pos, force  )
	
	//floor to ground
	if(this.pos[1] < 0) this.pos[1] = 0
	
	
	
}
Vertex.prototype.set = function( a ) {
	

	this.pos[0] = a[0]
	this.pos[1] = a[1]
	this.pos[2] = a[2]
	
	vec3.copy( this.oldPos, this.pos)
	
}
Vertex.relax = function( a,b, d, stiffness, coef ){
	
	var normal = vec3.sub( [], a.pos, b.pos)
	
	

	var l = vec3.squaredLength( normal )
	var s = ( (d - l ) / l ) * stiffness * coef 
	
	//vec3.normalize( normal,normal)
	vec3.scale( normal, normal, s )
	var half = vec3.scale([], normal, 0.5)
	
	if(!a.pin) {
		
		vec3.add( a.pos, a.pos,  half )
	}
	if(!b.pin){
		vec3.sub( b.pos, b.pos, half )
	}
}
var rig ={
	vertices:[],
	pins:[],
	constraints:[],
	gravity:[0,-0.04,0],
	viscosity:1,
	its:1,
	coef:1/1,
	stiffness: 0.05,
	geometry:null,
	init:function( geom ){
		
		var i, s = 1
		
		for (i=0; i< geom.vertices.length;i++){
			
			var v = geom.vertices[i]
			
			this.pins.push( 
				new Vertex( 
				v[0], 
				v[1], 
				v[2], 
				true ) 
			)
			this.vertices.push( 
				new Vertex( 
					v[0] * s,  
					v[1] * s, 
					v[2] * s, 
					false ) 
			)
		}
		
		for (i=0; i< geom.edges.length;i++){
			
			var a = this.vertices[ geom.edges[i][0] ]
			var b = this.vertices[ geom.edges[i][1] ]
			var d = dist3( a.pos, b.pos )
			
			this.constraints.push( [ a, b, d, this.stiffness ] )
			
		}
		
		for (i=0; i< this.pins.length;i++){
			
			var a = this.pins[ i ]
			var b = this.vertices[ i ]
			var d = dist3( a.pos, b.pos )
			
			
			this.constraints.push( [ a, b, d, this.stiffness*2.5 ] )
		}
		
		this.geometry = geom
		
	},
	update:function(matrix){
		var i
		
		for( i = 0, l=this.pins.length; i < l; i++ ){
			
			var v = vec3.transformMat4( [], this.geometry.vertices[i], matrix )
			this.pins[i].set( v )
			
			
		}
		
		for( i = 0, l=this.vertices.length; i < l; i++ ){
			
			this.vertices[i].integrate( this.gravity, this.viscosity)
			
			
		}
		
		for(var j=0, n=this.its; j < n;j++){
			
			for(var i=0,l = this.constraints.length; i<l;i++){
				
				var a = this.constraints[i][0]
				var b = this.constraints[i][1]
				var d = this.constraints[i][2]
				var s = this.constraints[i][3]
				
				Vertex.relax( a, b, d , s, this.coef )
			}
		}
		
		
	},
	drawFaces: function ( ctx, m, camera ){
		
		var g = this.geometry
		var lightPos =[-5,10,-5]
	
		var i,j,k,v,f
		var verts = []
		var verts3 = []
		var shadow =[]
		
		for(var i= 0,l=this.vertices.length; i<l;i++){
				
			v= vec3.transformMat4( [], this.vertices[i].pos, m )
			
			verts.push( v )
			verts3.push( this.vertices[i].pos )
			
			var lightDir = vec3.sub([], this.vertices[i].pos, lightPos )
			vec3.normalize( lightDir,lightDir)
			var pp = intersectRayPlane( [0,1,0], lightPos, lightDir, 0 )
			if(pp) shadow.push(vec3.transformMat4( [], pp, m ))
			
			
		}
		
		sortByDistance( g.faces, verts3, camera.position)
		
		ctx.fillStyle = 'rgba( 0, 0, 0, 0.4)'
		ctx.lineWidth=1
		for(i=0;i<g.faces.length;i++){
			
			f = g.faces[i]
			v =[]
			for( k=0;k<f.length;k++){
				
				v.push( shadow[ f[k] ] )
				
			}
			if( clockwise(v) ) continue
			ctx.beginPath()
			ctx.moveTo( cx + v[0][0]*scale, cy - v[0][1]*scale)
			for(k=1;k<v.length;k++){
				ctx.lineTo( cx + v[k][0]*scale, cy - v[k][1]*scale)
			}
			ctx.lineTo( cx + v[0][0]*scale, cy - v[0][1]*scale)
			ctx.fill()
		}
		
		for(i=0; i< g.faces.length;i++){
			
			f = g.faces[i]
			v = []
			var v3 =[]
			
			for( j=0;j<f.length;j++){
				
				v.push( verts[ f[j] ] )
				v3.push( verts3[ f[j] ] )
				
			}
			//if( !clockwise(v)) continue
			
			var v0 = vec3.sub( [],v3[0],v3[1])
			var v1 = vec3.sub( [],v3[2],v3[1])
			var normal = vec3.cross([],v0,v1)
			var c = center( f, verts3 )
			var toCam = vec3.sub( [], c, camera.position)
			
			if( vec3.dot( normal, toCam ) <= 0 ) continue
			
			var lpos = vec3.normalize([], [2,-2,3] )
			vec3.normalize( normal,normal)
			var lightValue = Math.max( -0.1, vec3.dot( lpos, normal ) )
			
			var col = shadeRGB( [0,140,140], (lightValue - 0.5) )
			var colStr = 'rgb('+col[0]+','+col[1]+','+col[2]+')'
			
			ctx.fillStyle = colStr
			ctx.strokeStyle = colStr
			ctx.beginPath()
			ctx.moveTo( cx + v[0][0] * scale, cy - v[0][1] * scale ) 
			
			for(k=1;k<v.length;k++){
				
				ctx.lineTo( cx + v[k][0] * scale , cy - v[k][1] * scale ) 
			}
			
			ctx.lineTo( cx + v[0][0] * scale, cy - v[0][1] * scale )
			
			ctx.stroke()
			ctx.fill()
			
		}
		
		
		
	}
	
}

var grid = createGridFaces(12,3)
console.log(grid.faces.length)
var edges = extractEdges( grid.faces)

var camera = lookAtCamera()
camera.setLambda(0)
camera.setPhi(0.7)
camera.setTarget([0,0,-8])
camera.setDistance(23)
camera.updateStatic()



var projection = mat4.perspective( mat4.create(), 0.7, 1, 0.01, 500 )
var view = mat4.multiply( mat4.create(), projection, camera.matrix )

var geom = initGeometry( Geometry.icosphere() )

var player={
	
	position: [0,1,0],
	matrix: mat4.create(),
	forward:[0,0,1],
	dir:[0,0,1],
	speed:0,
	rotSpeed:0.04,
	rotY: quat.create(),
	rotX: quat.create(),
	ax:0,
	friction:0.98,
	move:function(d){
		
		this.ax += 0.0005*d 
		this.ax = clamp( this.ax, -0.02,0.02)
		
	},
	rotate:function(d){
		
		var v = this.rotSpeed*d
		
		quat.rotateY( this.rotY, this.rotY, v)
		
		this.dir = vec3.transformQuat( [], this.forward, this.rotY)
	
		
		
	},
	rotateVec2:function(v2){
		
		var v = [ -v2.x, 0, -v2.y]
		
		vec3.normalize(v, v)
		
		this.rotY = quat.rotationTo([], this.forward, v )
		
		this.dir = v
	
		
		
	},
	update: function(){
		
		var boundx = 10
		var boundz = 16
		var maxSpeed = 0.15
		
		this.speed += this.ax
		
		
		this.speed = clamp( this.speed, -maxSpeed, maxSpeed )
		
		quat.rotateX( this.rotX, this.rotX, this.speed)
		
		vec3.add( this.position, this.position, vec3.scale( [], this.dir, this.speed ) )
		
		var q = quat.multiply([], this.rotY, this.rotX)
		
		
		
		this.position[0] = clamp( this.position[0], -boundx,boundx)
		this.position[2] = clamp( this.position[2], -boundz,boundz)
		
		mat4.fromRotationTranslation( this.matrix, q, this.position )
		
		this.speed *= this.friction 
	}
}

player.update()
rig.init( geom )
rig.update(player.matrix)


function draw( delta ){
	
	delta *= 0.1
	
	var start = performance.now()
	
	if( stick.active ){
		
		var l = stick.dir.length()
		
		player.speed = l*0.003
		player.rotateVec2( stick.dir)
		
	}
	else{
	
		//up-down
		if( upDown ){
			player.move(1)
		}
		else if( downDown ){
			player.move(-1)
		}
		else{
			player.ax *= 0.8
		}
			
		//left-right
		if( leftDown ){
			
			player.rotate(1)
		}
		else if( rightDown ){
			
			player.rotate(-1)
		}
		else{
		
		}
		
		
	}
	player.update()
	rig.update( player.matrix )
	
	
	
	ctx.clearRect(0,0,width,height)
	
	//debug
	ctx.lineWidth = 3
	drawVec( [ player.position[0], 0 ,player.position[2] ],player.dir, view, 'orange',2)
	ctx.lineWidth = 0.5
	//grid
	drawGridEdges( ctx, grid,edges, view ,'black')
	
	rig.drawFaces(ctx,view,camera)
	ctx.lineWidth = 3
	stick.draw(ctx)
	
	
	
	trace.textContent = ( performance.now() - start ).toFixed(2)
	
}

function initGeometry(data){
	
	var geom ={
		vertices: data[0],
		faces: data[1],
		edges: data[2],
		centers: [],
		normals:[],
		edgeFaces:[]
	}
	
	for(var i=0; i<geom.faces.length;i++){
		var f = geom.faces[i]
		var v = []
		for(var j=0; j<f.length;j++){
			
			var vv = geom.vertices[ f[j] ]
			v.push([vv[0],vv[1],vv[2]] )
		}
		
		var c =  calcCenter(v)
		f.center = c
		f.index = i
		
		var n = calcNormal(v)
		f.normal = n
		geom.normals.push( [ n[0], n[1], n[2] ])
		geom.centers.push( [ c[0], c[1], c[2] ])
		
	}
	geom.edgeFaces = extractEdgeFaces( geom.edges, geom.faces )
	
	return geom
}
function calcCenter(v){
	var x=0
	var y=0
	var z=0
	var l = v.length
	for(var i=0; i<l;i++){
		x += v[i][0]
		y += v[i][1]
		z += v[i][2]
	}
	
	return [ x/l, y/l, z/l ]
}
function calcNormal(v){
	
	var v0 = vec3.sub([], v[0],v[1])
	var v1 = vec3.sub([], v[2],v[1])
	var cross = vec3.cross([],v1,v0)
	return vec3.normalize(cross,cross)
}
function extractEdgeFaces( edges, faces ){
	
	var a = []
	
	for( var i=0; i< edges.length; i++ ){
		
		var edge = edges[i]
		
		var b = []
		
		for( var j=0; j < faces.length; j++ ){
			
			var face = faces[j]
			
			if( face.indexOf( edge[0] ) > -1 && face.indexOf( edge[1] ) > -1 ){
				
				b.push( j )
			}
			
		}
		
		a.push(b)
	}
	return a
}



function drawVec( o,v, m, color,s){
	
	s = s || 1
	
	var ot = vec3.transformMat4( [], o, m )
	var v = vec3.scaleAndAdd( [], o, v, s )
	vec3.transformMat4( v, v, m )
	
	ctx.beginPath()
	ctx.moveTo( cx + ot[0]*scale, cy - ot[1]*scale)
	ctx.lineTo( cx + v[0]*scale, cy - v[1]*scale)
	ctx.strokeStyle = color || 'orange'
	ctx.stroke()
}
/*=============== LOOP ==========================*/
var last = 0


function loop(time){
	
	requestAnimationFrame(loop)
	
	var delta = time - last
	
	last = time
	
	draw( delta )
	

}


requestAnimationFrame(loop)


//mouse
function onDown(e){
	
	mouse.update( e, width )
	
	
	
	mouse.delta.zero()
	mouse.direction.zero()
	
	mouse.lastPos.copy( mouse.pos )
	mouse.startPos.copy( mouse.pos )
	
	mouse.down = true
	
	if( mouse.target ){
		
		var offset = mouse.target.pos.clone().sub( mouse.pos )
		
		mouse.targetOffset.copy( offset )
		
		if(offset.length() < mouse.target.radius){
			 mouse.targetActive = true
			 mouse.target.active = true
		 }
		
	}
}
function onUp(e){
	
	mouse.down = false
	
	
	mouse.delta.zero()
	mouse.direction.zero()
	mouse.targetOffset.zero()
	mouse.targetActive=false
	mouse.target.active = false
	
}
function onMove(e){
	
	mouse.update( e, width )
	
	if(mouse.down){
		
		var delta = mouse.pos.clone().sub( mouse.lastPos )
		
		mouse.direction = mouse.pos.clone().sub( mouse.startPos )
		
		
		if(delta.lengthSq() > 25){
			
			mouse.delta = delta
			mouse.lastPos.copy( mouse.pos )
		}
		
		if(mouse.target && mouse.targetActive){
			
			mouse.target.pos.copy( mouse.pos.clone().add( mouse.targetOffset) )
			
		}
	}
}


canvas.addEventListener('mousedown',onDown,false)
canvas.addEventListener('mouseup',onUp,false)
canvas.addEventListener('mousemove',onMove,false)
canvas.addEventListener('mouseleave',onUp,false)

if( 'ontouchstart' in window){
	
	canvas.addEventListener('touchstart', onDown, false)
	canvas.addEventListener('touchmove', onMove, false)
	canvas.addEventListener('touchcancel', onUp, false)
	canvas.addEventListener('touchend', onUp, false)
}
//bind keys
	
function onKeyDown(e) {

	if(e.keyCode == 39 || e.keyCode == 68 ) {
		rightDown = true
	}
	else if(e.keyCode == 37 || e.keyCode == 65 ) {
		
		leftDown = true
		
	}
	if(e.keyCode == 40  || e.keyCode == 83 ) {
		downDown = true
		
	}
	else if(e.keyCode == 38 || e.keyCode == 87  ) {
		upDown = true
	}
	
}
function onKeyUp(e) {
	
	if(e.keyCode == 39 || e.keyCode == 68) {
		rightDown = false
	}
	else if(e.keyCode == 37 || e.keyCode == 65) {
		leftDown = false
	}
	if(e.keyCode == 40 || e.keyCode == 83) {
		downDown = false
	}
	else if(e.keyCode == 38 || e.keyCode == 87) {
		upDown = false
	}
	
}

document.addEventListener('keydown', onKeyDown, false)
document.addEventListener('keyup', onKeyUp, false)
