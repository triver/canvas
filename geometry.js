(function(global){

//square pyrmid height = 1 / sqrt(2)*a slant = sqrt(3)/2*a
// golden ratio (1 + Math.sqrt(5) )*0.5

//helpers
function pyramidSide( n, r ){
	return 2 * r * Math.sin( Math.PI / n )
}
function pyramidHeight( n, r ){
	var s = 2 * r * Math.sin( Math.PI / n )
	return Math.sqrt( s*s - r*r )
}
function sec2(a){
	return 1 / Math.pow(Math.cos(a),2)
}
function antiprismHeight(n,r){
	
	var side = 2 * r * Math.sin( Math.PI / n )
	return Math.sqrt( 1 - sec2( Math.PI/(2*n) ) / 4  ) * side
}
function triangleCenter(tri){
	
	return [ (tri[0][0] + tri[1][0] + tri[2][0] ) / 3,
			 (tri[0][1] + tri[1][1] + tri[2][1] ) / 3,
			 (tri[0][2] + tri[1][2] + tri[2][2] ) / 3 ]
}
function cycle( v, min, max ){
	
	if( v > max )
		return (v % max ) + min
	else if( v < min) 
		return max - ( min - v )
	else
		return v
}
function clamp(num, min, max) {
	return num < min ? min : (num > max ? max : num);
}
function extractEdges(faces){
	
	var edges = []
	var check = []
	var i,j,min,max,a,b,key,face
	
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
function sub(a,b){
	return [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ]
}
function add(a,b){
	return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ]
}
function clone(a){
	return [ a[0], a[1], a[2] ]
}
function cross(a,b){
	return [ a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0] ]
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
function normalize(p){
		
	var len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2])
	
	if(len === 0) {
		return [ p[0], p[1], p[2] ]
	}
	var num = 1.0 / len;

	return [ p[0] * num, p[1] * num, p[2] * num ]
}
function lerp(a,b,t){
	return [ a[0] + t * ( b[0] - a[0] ), a[1] + t * ( b[1] - a[1] ), a[2] + t * ( b[2] - a[2] ) ]
}
function length(a){
	return Math.hypot( a[0], a[1], a[2] )
}
//Möller–Trumbore intersection
var epsilon = 0.000001
var epsilonInv = 1 / epsilon

function rayTriangleIntersect( rayPos, rayDir, v0, v1, v2 ){

	var edge1 = sub( v1, v0)
	var edge2 = sub( v2, v0)
	
	var h = cross( rayDir, edge2 )
	var a = dot( edge1, h )
	
	if(a > -epsilon && a < epsilon) return false // ray is paralell
	
	var f = 1.0/ a
	var s = sub( rayPos, v0 )
	var u = f * dot( s, h )
	
	if(u<0 || u > 1) return false
	
	var q = cross( s, edge1 )
	var v = f * dot( rayDir, q )
	
	if( v < 0 || u + v > 1.0 ) return false
	
	var t = f *  dot( edge2, q )
	
	if( t > epsilon && t < epsilonInv ){
	
		return  true 
	
	}
	
	return false

}
function centroid3d(verticies){
	
	var s = [0,0,0]
	var areaTotal = 0.0

	var p1 = verticies[0];
	var p2 = verticies[1];

	for (var i = 2; i < verticies.length; i++)
	{
		var p3 = verticies[i]
		var edge1 = sub( p3,p1) //p3 - p1;
		var edge2 = sub( p3,p2) //p3 - p2;

		var crossProduct = cross( edge1, edge2)
		var area = length( crossProduct ) / 2

		s[0] += area * (p1[0] + p2[0] + p3[0])/3;
		s[1] += area * (p1[1] + p2[1]  + p3[1])/3;
		s[2] += area * (p1[2]  + p2[2] + p3[2])/3;

		areaTotal += area
		p2 = p3
	}

  
	return [ s[0] /areaTotal, s[1] /areaTotal, s[2] /areaTotal ]
}
function makeAA(n){
			
	var a =[]
	for(var i=0; i<n; i++){
		a[i] = []
	}
	return a
}
function vertexEdges(v,e){
	var ve =[]
	
	for(var i=0;i<v.length;i++){
		
		var q =[]
		for(var j=0;j<e.length;j++){
			
			if( e[j][0] === i ){
				q.push( e[j][1])
			}
			else if( e[j][1] === i ){
				q.push(e[j][0])
			}
		
		}
		
		ve.push( q )
	}
	return ve
}
function edgeFaces( edges, faces ){
			
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
function findEdgeIndex( edges, a, b){
			
	for(var i=0; i<edges.length;i++){
		
		if( (edges[i][0] === a && edges[i][1] === b) || (edges[i][0] === b && edges[i][1] === a) ){
			
			return i
		}
		
	}
	
	return -1
}
function orderFaces( vertices, faces){
			
	var i,j
	for(i=0;i<faces.length;i++){
		
		var f = faces[i]
		
		var vecs = []
		
		
		
		for(j=0;j<f.length;j++){
			
			var v = clone( vertices[ f[j] ] )
			v.index=f[j]
			vecs.push( v)
			
		}
		
		var v0 = centroid3d( vecs )
		var v1 = sub(  vecs[1], vecs[0] )
		var v2 = sub(  vecs[vecs.length-1], vecs[0] )
		var vn = cross( v2,v1)
		
		vn = normalize(vn)
		v1 = normalize(v1)

		var v3 = cross( v1, vn)
		v3 = normalize(v3)
		
		
		var ux0 =dot( v0, v1)
		var uy0 = dot( v0, v3)
		
		for(j=0;j<vecs.length;j++){
			
			var vvv = vecs[j]
			
			var ux = dot( vvv, v1)
			var uy = dot( vvv, v3)
			
			var vv = [ux,uy]
			
			vv.index = vecs[j].index
			
			vecs[j] = vv
			
		}
		
		vecs.sort(function(a,b){
			
			return Math.atan2( a[1] - uy0 , a[0] - ux0) -  Math.atan2( b[1] - uy0 ,b[0]-ux0) 
		})
	
		var newFace = vecs.map(function( arr ){ 
			
			return arr.index 
			
		})
		faces[i] = newFace
		
	}
	
	return faces
}
function checkWinding(g){
			
	var vertices = g[0]
	var faces = g[1]
	
	for(var i=0; i<faces.length; i++){
		
		var f = faces[i]
		
		var vv = []
		for(var n=0; n<f.length;n++){
			vv.push( vertices[ f[n] ])
		}
		var v0 = centroid3d(vv)
		
		
		var v1 = sub( vertices[ f[0] ], v0 )
		var v2 = sub( vertices[ f[1] ], v0 )
		
		var normal = normalize( cross(v1, v2) )
	
		
		for(var j=0; j<faces.length; j++){
			
			if( j === i ) continue
			
			var f2 = faces[j]
			var a = vertices[ f2[0]]
			
			var doBreak = false
			
			for(var k =1, l=f2.length-1; k<l; k++){
				
				var b = vertices[ f2[k] ]
				var c = vertices[ f2[k+1] ]
				
				
				
				if( rayTriangleIntersect( v0, normal, a, b, c ) ){
					
					faces[i].reverse()
					doBreak=true
					break
				}
				
			}
			
			if( doBreak) break
		}
		
	}
	
	return g
}
function truncate( g, t ){
	
	if(!t) return g
	
	if(t>=0.5) t= 0.499999
			
	var vertices = g[0]
	var faces = g[1]
	var edges = g[2]
	
	var ve = vertexEdges(vertices,edges)
	var ef = edgeFaces( edges, faces )
	
	var newVerts = []
	var newFaces = []
	var newEdges = []
	var oldFaces = makeAA(faces.length)
	
	for(var i=0; i<vertices.length;i++){
		
		var vertEdges = ve[i]
		var idx = newVerts.length
		
		var f=[]
		
		var a = vertices[i]
		
		for( var j=0;j<vertEdges.length;j++){
			
			var b = vertices[ vertEdges[j] ]
			
			newVerts.push( lerp(  a, b, t  ) )
			
			f.push( idx + j )
			
			
			var ei = findEdgeIndex( edges, i, vertEdges[j] )
			
			if( ei > -1){
				
				var eq = ef[ei]
				
				for( var k=0; k<eq.length;k++){
					
					oldFaces[ eq[k] ].push( idx + j )
				}
				
			}
		}
		
		newFaces.push( f ) 
		
	}
	var finalF = orderFaces( newVerts, newFaces.concat( oldFaces ) )
	
	var out = checkWinding([ newVerts, finalF, extractEdges( finalF ) ] )
	
	
	return out
}
function subdivide(base) {
	
		var positions = base[0]
		var cells = base[1]
		var newCells = []
		var newPositions = []
		var midpoints = {}
		
		var l = 0

		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i]
			var c0 = cell[0]
			var c1 = cell[1]
			var c2 = cell[2]
			var v0 = positions[c0]
			var v1 = positions[c1]
			var v2 = positions[c2]

			var a = getMidpoint(v0, v1, midpoints)
			var b = getMidpoint(v1, v2, midpoints)
			var c = getMidpoint(v2, v0, midpoints)

			var ai = newPositions.indexOf(a)
			if (ai === -1) ai = l++, newPositions.push(a)
			var bi = newPositions.indexOf(b)
			if (bi === -1) bi = l++, newPositions.push(b)
			var ci = newPositions.indexOf(c)
			if (ci === -1) ci = l++, newPositions.push(c)

			var v0i = newPositions.indexOf(v0)
			if (v0i === -1) v0i = l++, newPositions.push(v0)
			var v1i = newPositions.indexOf(v1)
			if (v1i === -1) v1i = l++, newPositions.push(v1)
			var v2i = newPositions.indexOf(v2)
			if (v2i === -1) v2i = l++, newPositions.push(v2)

			newCells.push([v0i, ai, ci])
			newCells.push([v1i, bi, ai])
			newCells.push([v2i, ci, bi])
			newCells.push([ai, bi, ci])
		}

		return [ newPositions, newCells ]
		
		function getMidpoint(a, b, midpoints) {
			var point = midpoint(a, b)
			var pointKey = pointToKey(point)
			var cachedPoint = midpoints[pointKey]
			if (cachedPoint) {
			  return cachedPoint
			} else {
			  return midpoints[pointKey] = point
			}
		}

		function pointToKey(point) {
			return point[0].toPrecision(6) + ','
				 + point[1].toPrecision(6) + ','
				 + point[2].toPrecision(6);
		}

		function midpoint(a, b) {
			return [
				(a[0] + b[0]) / 2,
				(a[1] + b[1]) / 2,
				(a[2] + b[2]) / 2
			];
		}

		
	}
//triangulate
function dist(p1,p2){
			
	var dx = p1[0] - p2[0]
	var dy = p1[1] - p2[1]
	var dz = p1[2] - p2[2]
	return Math.abs( dx*dx + dy*dy + dz*dz )
}
function cost(points, i, j, k){
	var p1 = points[i]
	var p2 = points[k]
	var p3 = points[j]
	
	return dist(p1,p2) + dist(p2,p3) + dist(p3,p1)
}
function createTable(n){
	var t = []
	for(var i =0; i<n;i++){
		t[i] = []
	}
	return t
}

function printSolution( points, s, i, j, arr ){
	
	if( j-i < 2) return;
	
	arr.push([ points[i].index , points[ s[i][j] ].index, points[j].index ]);
	
	printSolution( points, s, i, s[i][j] , arr);
	printSolution( points, s, s[i][j], j, arr );
	
	return arr
}
function mTCDP(points){
	
	var n = points.length
	
	if (n < 3) return
	
	//create table
	var table = createTable(n)
	var s = createTable(n)

   for (var gap = 0; gap < n; gap++) 
   { 
	  for (var i = 0; i < n - gap; i++) 
	  { 
		  var j = i + gap
		  
		  if (j - i < 2 ) 
			 table[i][j] = 0.0; 
		  else
		  { 
			  table[i][j] = Infinity; 
			  for (var k = i+1; k < j; k++) 
			  { 
				var val = table[i][k] + table[k][j] + cost(points,i,k,j); 
				
				if (val < table[i][j] ){ 
					 table[i][j] = val; 
					 s[i][j] = k;
				 }
			  } 
		  } 
	  } 
   } 
  
   return  printSolution(points, s, 0, n-1, [] ) 
}
function triangulateGeometry(geometry){
	
	
	var vertices = geometry[0]
	var faces = geometry[1]
	
	var triangles =[]
	
	var i,j
	
	for(i=0;i<faces.length;i++){
		
		var a = faces[i]
		
		if(a.length === 3){
			
			triangles.push(a)
		}
		else
		{
			var vecs = []
			
			for(j=0;j<a.length;j++){
				
				var vv = vertices[a[j]]
				var v = [ vv[0], vv[1], vv[2] ]
				v.index = a[j]
				vecs.push(v)
				
				
			}
			
			triangles = triangles.concat( mTCDP(vecs) )
			
		}
		
		
	}
	
	geometry[1] = triangles
	geometry[2] = extractEdges( geometry[1] )
	
	return geometry
}
//funcs
function pyritohedron(h){
			
	h = (typeof h == 'undefined') ? ( -1 + Math.sqrt(5) ) * 0.5 : h
	
	var w = 0.5
	var h2 = (1 - h*h)*w
	var h1 = (1 + h)*w
	
	var v =[
		//cube
		[-w,-w,+w],
		[-w,+w,+w],
		[+w,+w,+w],
		[+w,-w,+w],
		
		[-w,-w,-w],
		[-w,+w,-w],
		[+w,+w,-w],
		[+w,-w,-w],
		
		//y
		[0, h1, h2],
		[0, h1,-h2],
		[0,-h1,h2],
		[0,-h1,-h2],
		
		//x
		[-h1,h2, 0],
		[-h1,-h2,0],
		[h1,h2,  0],
		[h1,-h2, 0],
		
		//z
		[ h2,0,h1],
		[-h2,0,h1],
		[h2,0,-h1],
		[-h2,0,-h1]
	]
	
	var f = [
		
		//back
		[1,8,2,16,17],
		[0,17,16,3,10],
		//front
		[5,19,18,6,9],
		[4,11,7,18,19],
		//left
		[2,14,15,3,16],
		[6,18,7,15,14],
		//right
		[5,12,13,4,19],
		[1,17,0,13,12],
		
		[1,12,5,9,8],
		[2,8,9,6,14],
		
		[0,10,11,4,13],
		[10,3,15,7,11]
		
	
	]
	f = f.map(function(a){
		return a.reverse()
	})
	var e = extractEdges( f )
	
	return [ v, f, e]
}
function getAntiprismTowerData( n, r, t ){
	
	t = t || 2
	r = r || 1
	n=  n || 3		
	var step = Math.PI * 2 / n
	var side = 2 * r * Math.sin( Math.PI / n )
	var h = Math.sqrt( 1 - sec2( Math.PI/(2*n) ) / 4  ) * side
	var hh = h*t/2
	var rot = step/2
	var rotSin = Math.sin(rot)
	var rotCos = Math.cos(rot)
	var v =[]
	var f=[] 
	
	
	var b1 =[]
	var b2 =[]
	var base =[]
	
	for( var i = 0; i < n; i++ ){
		
		var theta = i*step
		var ii = i*2
		var x = Math.cos(theta)*r
		var z = Math.sin(theta)*r
		
		base.push([x,hh,z])
		v.push([x,hh,z])
		b1.push(n-i-1)
	}
	for( var i = 0; i < t; i++ ){
		
		var l = v.length - 1
		var l2 = l -n
		
		for(var j=0; j < n; j++ ){
			
			var x = base[j][0]
			var y = base[j][1]
			var z = base[j][2]
			var offset = -h*(i+1) + hh
			
			var i0 = l + j + 1 
			var i1 = cycle( i0 + 1, l, l + n )
			var i2 = i0 - n
			var i3 = cycle( i2 + 1, l2, l2 + n )
		
			
			if( i % 2 === 0){
				
				v.push([rotCos*x - rotSin*z,offset,rotSin*x + rotCos*z])
				
				f.push( [i0, i2, i3] )
				f.push( [i0, i3, i1] )
				
			}else{
				v.push([x,offset,z])
				f.push( [i1, i2, i3] )
				f.push( [i0, i2, i1] )
			}
			
			if(i===t-1) b2.push(i0)
		}
		
		
	}
	f.push(b1,b2)
	
	var e = extractEdges( f )
	return [v,f,e]
}
function getPyramidData( n, r, bi ){
	 bi = typeof bi == 'undefined' ? true : bi
	n = parseInt(n) || 3
	
	n = clamp( n, 3,5 )
	r = r || 1
			
	var step = Math.PI * 2 / n
	var side = 2 * r * Math.sin( Math.PI / n )
	var h = Math.sqrt( side * side - r * r )
	
	var v =[]
	var f=[] 
	var base = []
	
	for( var i = 0; i < n; i++ ){
		
		var t = i*step
		
		var x = Math.cos(t)*r
		var z = Math.sin(t)*r
		
		v.push([x,0,z])
		
		f.push([i, (i+1) % n, n] )
		
		if(bi){
			f.push([ (i+1) % n, i,  n + 1] )	
		}
		else{
				
			base.unshift(i)
		}
	}
	
	v.push([0,-h,0])
	
	if(bi){
		
		v.push([0, h,0])		
	}
	else{
			
		f.push(base)
	}
	
	var e = extractEdges( f )
	
	return [v, f, e]
}
function getAntiprismData( n, r, open ){
	
	n = parseInt(n) || 4
	
	n = clamp( n, 3, 10)
	
	r = r || 1
			
	var step = Math.PI * 2 / n
	var side = 2 * r * Math.sin( Math.PI / n )
	var h = Math.sqrt( 1 - sec2( Math.PI/(2*n) ) / 4  ) * side
	var hh = h/2
	var rot = step/2
	var rotSin = Math.sin(rot)
	var rotCos = Math.cos(rot)
	var v =[]
	var f=[] 
	var nn = n*2
	
	var b1 =[]
	var b2 =[]
	
	for( var i = 0; i < n; i++ ){
		
		var t = i*step
		var ii = i*2
		var x = Math.cos(t)*r
		var z = Math.sin(t)*r
		
		v.push([x,-hh,z])
		v.push([rotCos*x - rotSin*z,hh,rotSin*x + rotCos*z])
		
		f.push([ii,ii+1, (ii+2) % nn])
		f.push([ii+1, (ii+3) % nn, (ii+2) % nn])
		
		b1.push(ii)
		b2.unshift(ii+1)
		
	}
	if(!open) f.push(b1,b2)
	
	var e = extractEdges(f)
	return [v,f,e]
}
function getElongatedPyramidData( n, r ){
	
	n = parseInt(n) || 4
	
	n = clamp( n, 3, 5)
	
	r = r || 0.5
			
	var prism = getAntiprismData( n, r, true )
	
	var verts = prism[0]
	var faces = prism[1]
	
	var l = verts.length
	
	var h = antiprismHeight( n, r )
	var hh = h/2
	
	var h2 = pyramidHeight( n, r )
	
	for(var i=0; i<l; i += 2){
		
		var ii = i+1
		
		faces.push([i, (i+2) % l, l ])
		faces.push([ (ii+2) % l, ii, l + 1 ])
		
	}
	
	verts.push([0,-(hh+h2), 0],[0,(hh+h2),0])
	
	prism[2] = extractEdges( faces )
	
	if(n===5) prism[0] = prism[0].map( normalize)
	
	return prism
}
function cube(norm){
			
	v = [
	
	[-0.5,-0.5,-0.5],
	[-0.5, 0.5,-0.5],
	[ 0.5, 0.5,-0.5],
	[ 0.5,-0.5,-0.5],
	
	[-0.5,-0.5, 0.5],
	[-0.5, 0.5, 0.5],
	[ 0.5, 0.5, 0.5],
	[ 0.5,-0.5, 0.5]
	
	]
	
	f = [
	
	[0,1,2,3],
	[4,7,6,5],
	[3,2,6,7],
	[0,4,5,1],
	[0,3,7,4],
	[1,5,6,2]
	]
	
	e = extractEdges(f)
	if(norm) v = v.map( normalize )
	return [v,f,e]
}
 function tetra(){
			
	var v = [
		[ 1, 1, 1],
		[ 1,-1,-1],
		[-1, 1,-1],
		[-1,-1, 1]
	]
	var f =[
		[1,2,0],
		[3,1,0],
		[2,3,0],
		[1,3,2]
	]
	
	v = v.map(normalize)
	e = extractEdges(f)
	return [ v ,f, e ]
}
function sphere (n1, n2){
	
	n1 = n1 || 3; //rows
	n2 = n2 || 6; // cols
	
	
	var deltaTheta = Math.PI / ( n1 + 1 );
	var deltaPhi = Math.PI*2 / n2;
	var phi = theta = 0;
	var i, j, row, row2, col, sin, cos;
	var v =[];
	var f = [];
	
	//pole 1
	v.push( [ 0, 1, 0 ]);
	for(i=1; i < n2 + 1; i++) f.push( [ 0 , i, i === n2 ? 1 : i + 1] );
	
	
	for(i=0; i < n1; i++){ 
	
		row = i * n2;
		row2 = ((i+1) % n1)*n2;
		
		theta += deltaTheta;
		sin = Math.sin( theta );
		cos = Math.cos( theta );
		
		
		for(j=0; j < n2; j++){ 

			phi += deltaPhi;
			
			v.push( [ sin * Math.cos(phi), cos, sin * Math.sin(phi) ] );

			col = (j + 1) % n2;
			
			if(i < n1 - 1 ) f.push([ row + j + 1, row2 + j +1, row2 + col + 1, row + col + 1]);					
		}
	}
	
	//pole 2
	var l = v.length;
	v.push([ 0, -1, 0 ]);
	
	for(i=1; i < n2 + 1; i++) f.push( [ l , l - i , i === n2 ? l - 1 : l - i - 1 ]);
		
	f = f.map( function(a){
		return a.reverse()
	})
	
	v = v.map(normalize);
	e = extractEdges(f)
	return [ v ,f, e ];
}
function icosaToDodeca(  r ){
	
	r = r || 1		
			
	var ico = getElongatedPyramidData( 5, r )
	var verts = ico[0]
	var faces = ico[1]
	
	var v=[]
	var f=[]
	
	for(var i=0; i<faces.length; i++){
		
		var va =[]
		
		for(var j=0; j<faces[i].length; j++){
			
			va.push( verts[ faces[i][j] ])
			
		}
		
		v.push( triangleCenter( va ) )
		
	}
	
	var top=[]
	var bottom =[]
	for( var i =0; i<10; i++){
		
		var i0 = i
		var i1 = (i+1) % 10
		var i2 = (i+2) % 10
		var i3 = i + 10
		var i4 = i + 12
	
		if( i & 1){
			f.push([ i0, i1, i2,  cycle( i4, 10,20),i3].reverse())
			top.push(i3)
		}
		else{
			f.push([ i2, i1, i0, i3, cycle( i4, 9, 19) ].reverse())
			bottom.push(i3)
		}
		
		
	}
	f.push( top.reverse(), bottom)
	var e = extractEdges( f )
	
	v = v.map(normalize)
	return [ v, f,e ]
}
function getIcosaData(r){
	return getElongatedPyramidData( 5 )
}
function getIcoSphereData(subs){
	subs = subs || 1;
			
	var ico = getElongatedPyramidData( 5 )
	
	while (subs-- > 0) ico = subdivide(ico);

	var v = ico[0].map(normalize)
	var f = ico[1]
	var e = extractEdges(f)
	
	return [ v,f,e] 
}
function torus(n1,n2, r1,r2){
	
	r1 = r1 || 0.7;
	r2 = r2 || 0.35;
	n1 = n1 || 8;
	n2 = n2 || 6;
	
	var PI2 = Math.PI*2;
	var v = [];
	var f = [];
	var deltaTheta = PI2 / n1;
	var deltaPhi = PI2 / n2;
	var theta = phi = 0;
	var i, j, sin, cos, d, row, row2, col;
	
	var odd = ( n2 & 1 )
	var odds = []
	var flag = 0
	var count = 0
	for(i=0; i < n1; i++){
		
		cos = Math.cos(theta);
		sin = Math.sin(theta);
		row = i*n2;
		row2 = ((i+1) % n1)*n2;
		
		for(j=0; j < n2; j++){
			
			d = r1 + r2 * Math.cos(phi);
			col = ((j + 1) % n2);
			
			v.push( [ cos * d, sin * d, r2 * Math.sin(phi)] );
			
			var face = [ row2 + col,row + col,row + j,row2 + j ]
			face.odd = flag
			face.index = count 
			f.push(face);
			odds.push( flag )
			phi += deltaPhi;
			
			flag = 1 - flag
			count++
		}
		if(!odd) flag = 1 - flag
		theta += deltaTheta;
	}
	
	var e = extractEdges(f)
	return [ v, f, e, odds ]
}
global.Geometry = {
	pyramid: getPyramidData,
	antiprism: getAntiprismData,
	elongatedPyramid: getElongatedPyramidData,
	dodeca: icosaToDodeca,
	icosa: getIcosaData,
	icosphere: getIcoSphereData,
	cube: cube,
	hexa: cube,
	tetra: tetra,
	sphere: sphere,
	torus: torus,
	tower: getAntiprismTowerData,
	pyritohedron: pyritohedron,
	octa:function(){ return getPyramidData( 4,1,true) },
	triangulate: triangulateGeometry,
	truncate: truncate
}



})(this);
