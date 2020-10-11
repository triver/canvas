var vec3 = glMatrix.vec3
var mat4 = glMatrix.mat4
var quat = glMatrix.quat


var width = 600
var height = 600
var cx = width / 2
var cy=height / 2


var canvas = document.getElementById('canvas')
var trace = document.getElementById('trace')
var select = document.getElementById('select')

var ctx = canvas.getContext('2d')

canvas.width=width
canvas.height=height

ctx.strokeStyle='orangered'
ctx.fillStyle = 'black'
ctx.lineWidth=2.5
ctx.lineJoin ='round'
ctx.lineCap='round'

function drawPolygon( face, verts, m){
	
	var v =[]
	for(var j=0; j<face.length;j++){
		v.push( vec3.transformMat4([],verts[ face[j] ] , m ) )
	}
	ctx.beginPath()
	ctx.moveTo( cx + v[0][0] * cx, cy - v[0][1] * cx )
	for(i=1; i < v.length; i++){
		
		ctx.lineTo( cx + v[i][0] * cx, cy - v[i][1] * cx )
	}
	ctx.closePath()
	ctx.stroke()
}


//geometry
function calcCenter(v){
	
	var x = 0, y = 0, z = 0,l = v.length
	
	for(var i=0; i<l;i++){
		x += v[i][0]
		y += v[i][1]
		z += v[i][2]
	}
	
	return [ x / l, y / l, z / l ]
}
function calcNormal(v){
	
	var v0 = vec3.sub( [], v[0], v[1] )
	var v1 = vec3.sub( [], v[2], v[1] )
	var cross = vec3.cross( [], v1, v0 )
	
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
function extractEdges(faces){
	
	var edges = []
	var check = []
	var i,j,min,max,a,b,key,face
	
	for( i=0,l=faces.length; i< l;i++){
		
		face = faces[i];
		
		for(j=0,l2=face.length;j< l2;j++){
			
			a = face[j]
			b = face[ (j + 1) % l2]
			min = Math.min( a, b )
			max = Math.max( a ,b)
			key = min+'_'+max;
			
			if( check.indexOf(key) === -1){
				edges.push([min,max])
				check.push(key) 
			}
		}
	}
	
	return edges
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
		c.index=i
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

//tree
function createGraph(edges){
	
	const g = []
	
	for(let i=0;i<edges.length; i++){
		
		const a = edges[i][0]
		const b = edges[i][1]
		
		if( g[a] == undefined) g[a] = {  links: [] }
		if( g[b] == undefined) g[b] = {  links: [] }
		
		//link both ways
		g[a].links.push(b)
		g[b].links.push(a)
		
	}
	return g
}

function dft( graph, root){

	const children = graph[root].children
	
	
	for( let i=0; i < children.length; i++ ){
			
			const childIdx = children[i]
			
			if( !graph[ childIdx ].hasOwnProperty('parent') ){
				
				graph[childIdx].parent = root
				graph[childIdx].children = graph[childIdx].links.filter( x => x !== root )
				dft( graph, childIdx )
			}
		
	}
}
function treeCenter( graph ){
	
	const n = graph.length
	
	const degree = graph.map( x => x.links.length )
	let leaves =[]
	
	var i,j
	
	for( i=0;i<n;i++){
		if(degree[i] == 0 || degree[i] == 1){
			leaves.push(i)
			degree[i] = 0
		}
	}
	
	let count = leaves.length
	
	while( count < n  ){
		
		const new_leaves = []
		
		for( i = 0; i  < leaves.length; i++ ){
			
			const node = leaves[i]
			for(j=0;j < graph[node].links.length ; j++ ){
				
				const link = graph[node].links[j]
				
				if( degree[link] === 0) continue
			
				degree[link] -= 1
			
				if(degree[link] == 1){
					
					new_leaves.push( link )
				}
			}
		}
		
		count += new_leaves.length
		leaves = new_leaves
		
		
	}
	
	return leaves.sort( (a,b) => graph[b].links.length - graph[a].links.length ).shift()
}	

function rootTree( edges ){
	
	const graph = createGraph( edges )
	const root = treeCenter( graph )
	
	graph[ root ].parent = false
	graph[ root ].children  = graph[ root ].links.slice(0)
	dft( graph, root )
	graph.root = root
	
	return graph
}

function traverseTree( tree, parent, cb ){
	
	for(var i=0; i < tree[parent].children.length;i++){
		
		var child =  tree[parent].children[i]
		
		cb( parent, child, tree )
		traverseTree( tree, child, cb )
	}
}


//metric for kruskal
function distanceSq( a, b ){
	//return 1
	var dx = a[0] - b[0]
	var dy = a[1] - b[1]
	var dz = a[2] - b[2]
	
	return ( dx*dx + dy*dy + dz*dz )
}

function initFold( geomName ){

	var geom = initGeometry( Geometry[ geomName ]() )
	
	if(!geom) return console.log( 'geometry not found')
	
	var minSpanTree = Kruskal( geom.centers, geom.edgeFaces, distanceSq )
	var tree = rootTree( minSpanTree )
	
	tree[tree.root].localMatrix = mat4.create()
	tree[tree.root].worldMatrix = mat4.create()
	
	//calculate axis and angle and create matrices
	traverseTree( tree, tree.root, function( parentIdx, childIdx, tree){
		
		var f1 = geom.faces[ parentIdx ]
		var f2 = geom.faces[ childIdx  ]
		
		var n1 = geom.normals[ parentIdx ]
		var n2 = geom.normals[ childIdx  ]
		
		var ei
		for(j=0; j< geom.edgeFaces.length; j++){
			
			var k = geom.edgeFaces[j]
			if( k.indexOf( parentIdx ) > -1 && k.indexOf(childIdx ) > -1 ){
				ei = j
				break;
			}
		}
		
		
		var edge = geom.edges[ei]
		
		var e1 = geom.vertices[ edge[0] ]
		var e2 = geom.vertices[ edge[1] ]
		
		var axis = vec3.sub([],e2,e1)
		vec3.normalize( axis,axis)
	
		var angle = vec3.angle(n2,n1)
		
		
		
		var cross = vec3.cross([],axis,n1)
		
		if( vec3.dot( cross, n2 ) < 0 ){
			angle *= -1
		}
		
		tree[childIdx].axis = axis
		tree[childIdx].angle = -angle
		tree[childIdx].origin = e1
		tree[childIdx].localMatrix = mat4.create()
		tree[childIdx].worldMatrix = mat4.create()
		
		
	} )
	
	return {
		
		geom: geom,
		tree: tree
	}
	
	
}
function drawFold(  geom, tree, view, t ){
	
	drawPolygon( geom.faces[tree.root], geom.vertices, view)
	
	traverseTree( tree, tree.root, function( parentIdx, childIdx , tree){
		
		var child = tree[ childIdx ]
		var parent = tree[ parentIdx ]
		
		var q = quat.setAxisAngle([], child.axis, child.angle*t )
	
		
		var m = mat4.create()
		mat4.fromRotationTranslation( m, q, child.origin)
		mat4.translate( m, m, vec3.negate( [], child.origin) )
		
		var wm = mat4.multiply( [],parent.worldMatrix , m )
		
		
		mat4.copy( child.localMatrix, m )
		mat4.copy( child.worldMatrix, wm)
		
		
		mat4.multiply( m, view, wm )
		
		drawPolygon( geom.faces[childIdx], geom.vertices, m)
		
	})
	
}


var camera = lookAtCamera()
camera.setPhi( 0.5)
camera.setLambda( 0.5)
camera.setDistance( 8)
camera.updateStatic()


var projection = mat4.perspective( mat4.create(), 0.78, 1, 1, 100 )
var view = mat4.multiply( mat4.create(), projection, camera.matrix )
var world = mat4.create()
var matrix = mat4.copy([],view)

var geom=null,tree=null,angle=0

function init( name ){
	
	var fold = initFold( name )
	geom = fold.geom
	tree = fold.tree
	
	var q = quat.rotationTo( [], vec3.normalize([], geom.centers[ tree.root] ), [0,-1,0])
	
	matrix = mat4.create()
	mat4.fromQuat( world, q )
	mat4.multiply( matrix, view, world)
	
	
	angle = 0
	
}

function draw( delta ){
	
	
	var start = performance.now()
	
	if(geom && tree){
		
		var t = -Math.cos(angle) * 0.5 + 0.5 
	
		ctx.clearRect(0,0,width,height)
		
		drawFold(  geom, tree, matrix, t)
		
		angle += 0.02
	}
	
	
	trace.textContent = ( performance.now() - start ).toFixed(2)
	
}


/*=============== LOOP ==========================*/
var last = 0


function loop(time){
	
	requestAnimationFrame(loop)
	
	var delta = time - last
	
	last = time
	
	draw( delta )
	

}

init(select.value)
requestAnimationFrame(loop)
