function cubeArrays(s, color, y){
	
	color = color || [0.5, 0.5, 0]//olive		
	s = s || 0.5
	
	y = y || s
	//face order -> front right back left top bottom
	
	const v =[
	
		 //front
		 -s,  y,  s,  
		 -s, -s,  s, 
		  s, -s,  s, 
		 
		 -s,  y,  s,
		  s, -s,  s, 
		  s,  y,  s,
		  
		  //right
		  s,  y,  s,  
		  s, -s,  s, 
		  s, -s, -s, 
		 
		  s,  y,  s,
		  s, -s, -s, 
		  s,  y, -s,
		  
		  //back
		  s,  y, -s,  
		  s, -s, -s, 
		 -s, -s, -s, 
		 
		  s,  y, -s,
		 -s, -s, -s, 
		 -s,  y, -s,
		 
		 //left
		 -s,  y, -s,  
		 -s, -s, -s, 
		 -s, -s,  s, 
		 
		 -s,  y, -s,
		 -s, -s,  s, 
		 -s,  y,  s,
		 
		 //top
		 -s,  y, -s,  
		 -s,  y,  s, 
		  s,  y,  s, 
		 
		 -s,  y, -s,
		  s,  y,  s, 
		  s,  y, -s,
		  
		  //bottom
		 -s, -s,  s,  
		 -s, -s, -s, 
		  s, -s, -s, 
		 
		 -s, -s,  s,
		  s, -s, -s, 
		  s, -s,  s 
		  
	]
		 
	
	const t = [
		
		//front
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0,
		
		//right
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0, 
		
		//back
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0,
		
		//left
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0,
		
		//top
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0,
		
		//bottom
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0
	]
	
	const n =[
	
		//front
		0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
		//right
		1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 
		//back
		0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 
		//left
		-1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, 
		//top
		0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 
		//bottom
		0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0
	]
	
	
	const c = []
	let count=0
	for(let i=0; i<v.length; i += 6){
		
		const r = 1.0//Math.random()
		const g = 0.6//Math.random()
		const b = 0.0//Math.random()
		const f = (count/6)*0.5 + 0.5
		for(let j=0; j<6; j++){
			
			c.push( r*f,g*f,b*f )
		}
		
		count++
	}
	return {
		position: v,
		texcoord: t,
		color: c,
		normal: n
	}
	
}
function cylinderArrays( n,r,h, offset, center){
	
	offset = offset || 0
	
	const theta = Math.PI*2/n
	const v0 = []
	const v1 = []
	const indices=[]
	
	const l = n*2
	
	let top, bottom
	if(center){
		
		const hh = h / 2
		top = hh
		bottom = -hh
	}else{
		top = h
		bottom = 0
	}
	
	for(let i=0; i<n;i++){
		
		const angle = i * theta + offset
		
		const x = Math.cos(angle) * r
		const z = Math.sin(angle) * r
		
		v0.push( x, top, z)
		v1.push( x, bottom, z)
		
		const i0 = i
		const i1 = i + n
		const i3 = (i + 1) % n
		const i2 = i3 + n
		
		indices.push(
			i0, i2, i1, 
			i0, i3, i2,
			i3,i0,l,
			i1,i2,l+1
		)
	}
	const v =  v0.concat( v1 )
	
	v.push( 0,top,0, 0,bottom, 0)
	
	const col=[]
	
	for(let i=0;i<v.length-6; i += 3 ){
		
		col.push(0.7,0.7,0.7)
	}
	col.push(1.0,1.0,1.0,0.0,0.0,0.0)
	return {
		position:v,
		color: col,
		indices: indices
	}
	
}
function quadXZArrays( size ){
	size = size || 0.5
	const v =[
		-size,  0, -size,  
		 -size, 0, size, 
		  size, 0, size, 
		 
		 -size, 0, -size,
		 size,  0,  size, 
		 size,  0, -size ]
		 
	
	const t = [
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0 
	]
	
	const n =[
		0,1,0, 0,1,0, 0,1,0, 
		0,1,0, 0,1,0, 0,1,0
	]
	
	return {
		position: v,
		texcoord: t,
		normal:  n
	}
	
}
function quadXYArrays( size ){
	size = size || 0.5
	const v =[
		-size,   size, 0,  
		 -size,  -size, 0, 
		  size,  -size, 0, 
		 
		 -size,   size,0,
		 size,    -size,0, 
		 size,   size,0 ]
		 
	
	const t = [
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0 
	]
	
	const n =[
		0,0,1, 0,0,1, 0,0,1, 
		0,0,1, 0,0,1, 0,0,1
	]
	
	return {
		position: v,
		texcoord: t,
		normal:  n
	}
	
}
function quadUnitArrays( size ){
	size = size || 1
	const v =[
		0,   0, 0,  
		0, size, 0, 
		size, size, 0, 
		 
		0,  0,0,
		size,    size,0, 
		 size,   0,0 ]
		 
	
	const t = [
		0,0, 0,1, 1,1,
		0,0, 1,1, 1,0 
	]
	
	const n =[
		0,0,1, 0,0,1, 0,0,1, 
		0,0,1, 0,0,1, 0,0,1
	]
	
	return {
		position: v,
		texcoord: t,
		normal:  n
	}
	
}
