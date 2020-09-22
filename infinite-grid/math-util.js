function clamp(num, min, max) {
			
	return num < min ? min : (num > max ? max : num);
}
function flatten(v){
			
	var a=[]
	
	for(var i=0; i<v.length; i++){
		
		for(var j=0; j< v[i].length; j++){
			
			a.push( v[i][j] )
		}
		
	}
	
	return a
}
function dist3(a,b){
	const dx = a[0] - b[0]
	const dy = a[1] - b[1]
	const dz = a[2] - b[2]
	
	return ( dx*dx + dy*dy + dz*dz )
}

