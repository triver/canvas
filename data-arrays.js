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
	
	for(let i=0; i<v.length; i += 3){
		
		c.push( color[0], color[1], color[2])
	}
	return {
		position: v,
		texcoord: t,
		color: c,
		normal: n
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
