
function powerOf2(v) {
    return v && !(v & (v - 1));
}
function glCompileShader(gl, shaderSource, shaderType) {
			
	// Create the shader object
	var shader = gl.createShader(shaderType)

	// Set the shader source code.
	gl.shaderSource(shader, shaderSource)

	// Compile the shader
	gl.compileShader(shader)

	// Check if it compiled
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	
	if (!success) {
		
		gl.deleteShader(shader)
		// Something went wrong during compilation; get the error
		throw "could not compile shader:" + gl.getShaderInfoLog(shader)
		
	}

	return shader;
}
function glCreateProgram(gl, vs,fs ) {
	
	const vertexShader = glCompileShader( gl, vs, gl.VERTEX_SHADER )
	const fragmentShader = glCompileShader( gl, fs, gl.FRAGMENT_SHADER )
	// create a program.
	var program = gl.createProgram();

	// attach the shaders.
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	// link the program.
	gl.linkProgram(program);

	// Check if it linked.
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
	  // something went wrong with the link
	  throw ("program filed to link:" + gl.getProgramInfoLog (program));
	}

	return program;
}
function glCreateTexture( gl, width, height, data, linear){
			
	const texture = gl.createTexture()
	
	gl.bindTexture(gl.TEXTURE_2D, texture)

	
	gl.texImage2D(
		gl.TEXTURE_2D,//target 
		0, //level
		gl.RGBA,//intformat
		width,//width
		height,//height
		0,//border 
		gl.RGBA,//format 
		gl.UNSIGNED_BYTE,//tipe 
		data//data
	)
	if(powerOf2(width) && width === height ){
		
		gl.generateMipmap( gl.TEXTURE_2D )
		
	}
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, !!linear ? gl.LINEAR : gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, !!linear ? gl.LINEAR : gl.NEAREST )
	
	gl.bindTexture(gl.TEXTURE_2D, null)
	
	return texture
}
function glCreateCubeTexture( gl, size, data, linear){
	
	const targets =[
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
	]
			
	const texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)

	for(let i =0; i<6;i++){

		gl.texImage2D(
			targets[i],//target 
			0, //level
			gl.RGBA,//intformat
			size,//width
			size,//height
			0,//border 
			gl.RGBA,//format 
			gl.UNSIGNED_BYTE,//tipe 
			data[i]
		)
	}
	if( powerOf2(size)){
		
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
		
	}
	
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, !!linear ? gl.LINEAR : gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, !!linear ? gl.LINEAR : gl.NEAREST )
	
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	
	return texture
}
function glCreateDrawArraysVAO( gl, data, location ){
	
	const hasPos = !!( location.hasOwnProperty('position'))
	if(!hasPos) console.alert('No position attribute  count === 0')
	
	//vertex array object
	const vao = gl.createVertexArray()
	gl.bindVertexArray(vao)
	
	
	const out = {
		
		vao: vao,
		elements:[],
		count:0
	}
	const attrib ={}
	
	for( const p  in location ){
		attrib[p] = []
	}

	for(let i=0; i<data.length;i++){
		
		const offset = out.count
		
		if(hasPos){
			
			const len = data[i].position.length / location.position.numComponents
			out.count += len
			out.elements.push({
				id: i,
				offset: offset,
				count: len
			})
		}
		for(const p in attrib){
			
			attrib[p].push.apply( attrib[p], data[i][p] )
		}
		
		
		
		
	}
	
	for( const p in attrib){
		
		const buffer = gl.createBuffer()
		const a = attrib[p]
	
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

		gl.bufferData(
			gl.ARRAY_BUFFER, 
			new Float32Array( a ), 
			gl.STATIC_DRAW
		)
		
		
		gl.enableVertexAttribArray(location[p].location)
		gl.vertexAttribPointer(
			location[p].location, //location 
			location[p].numComponents,//num components 
			gl.FLOAT,//component type 
			false,//normalize 
			0,//stride 
			0//offset
		)
		
	}
	
	gl.bindVertexArray(null)
	gl.enableVertexAttribArray(null)
	
	return out		
	
	
}
function glCreateDrawElementsVAO( gl, data, location ){
	

	const vao = gl.createVertexArray()
	gl.bindVertexArray(vao)
	
	
	const out = {
		
		vao: vao,
		elements:[],
		count:0
	}
	const attrib ={ indices: [] }
	
	for( const p  in location ){
		attrib[p] = []
	}

	for(let i=0; i<data.length;i++){
		
		if( !data[i].hasOwnProperty('indices') ){
			console.log('missing indices')
			continue
		}
		
		const offset = out.count
		
		const len = data[i].indices.length
		out.count += len
		out.elements.push({
			id: i,
			offset: offset,
			count: len
		})
	
		for(const p in attrib){
			
			
			attrib[p].push.apply( attrib[p], data[i][p] )
			
		}
		
		
		
		
	}
	
	for( const p in attrib){
		
		const buffer = gl.createBuffer()
		const a = attrib[p]
	
		
		
		if(p==='indices'){
			
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer )

			gl.bufferData(
				gl.ELEMENT_ARRAY_BUFFER, 
				new Uint16Array( a ), 
				gl.STATIC_DRAW
			)
					
			
		}else{
			
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
			
			gl.bufferData(
				gl.ARRAY_BUFFER, 
				new Float32Array( a ), 
				gl.STATIC_DRAW
			)
			
			
			gl.enableVertexAttribArray(location[p].location)
			gl.vertexAttribPointer(
				location[p].location, //location 
				location[p].numComponents,//num components 
				gl.FLOAT,//component type 
				false,//normalize 
				0,//stride 
				0//offset
			)
		}
		
	}
	
	gl.bindVertexArray(null)
	gl.enableVertexAttribArray(null)
	delete out.indices
	
	return out		
	
	
}

function glGetProgramLocations( gl, program, attributes, uniforms){
	
	const locs = {
		
		attributes:{},
		uniforms:{}
	}
	
	for( let i=0; i < attributes.length; i++){
		
		const obj = attributes[i]
		const prop = obj.attribute
		
		locs.attributes[ prop ] = {
			
			location: gl.getAttribLocation( program, obj.attribute ),
			numComponents: obj.numComponents
		} 
	}
	
	for( let i=0; i < uniforms.length; i++){
		
		const prop = uniforms[i]
		locs.uniforms[ prop ] =  gl.getUniformLocation( program, prop)
	}
	
	return locs
	
}
function glResizeCanvas(canvas, multiplier) {
	
	const width  = canvas.clientWidth;
	const height = canvas.clientHeight;
	if (canvas.width !== width ||  canvas.height !== height) {
	  canvas.width  = width;
	  canvas.height = height;
	  return true;
	}
	return false;
}
function glSetPixel( gl,texture, tx, ty, color ){
	
	gl.bindTexture( gl.TEXTURE_2D, texture)
	gl.texSubImage2D(
		gl.TEXTURE_2D,   //target 
		0,               //level
		tx, //offsetx
		ty,//offsety
		1, //width
		1, //height
		gl.RGBA, //format
		gl.UNSIGNED_BYTE,//type
		new Uint8Array( color )
	)
}
function glCreateDepthBufferTexture( gl, size ){
	
	const depthTexture = gl.createTexture()
	const depthTextureSize = size || 256
	
	gl.bindTexture(gl.TEXTURE_2D, depthTexture)
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT32F, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.FLOAT,           // type
		null)              // data
	
		
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	 
	const depthFramebuffer = gl.createFramebuffer()
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer)
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0) 
	
	
	
	const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
	 
	if (status != gl.FRAMEBUFFER_COMPLETE) {
		console.log('fb status: ' + status.toString(16))
		
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	
	return {
		texture: depthTexture,
		buffer: depthFramebuffer,
		size: depthTextureSize
	}
	
}
function glCreateColorBufferTexture( gl, size , linear){
	
	size = size || 256
	
	const colorTexture = gl.createTexture()
	
	gl.bindTexture(gl.TEXTURE_2D, colorTexture)

	
	gl.texImage2D(
		gl.TEXTURE_2D,//target 
		0, //level
		gl.RGBA,//intformat
		size,//width
		size,//height
		0,//border 
		gl.RGBA,//format 
		gl.UNSIGNED_BYTE,//tipe 
		null//data
	)

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, !!linear ? gl.LINEAR : gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, !!linear ? gl.LINEAR : gl.NEAREST )
	
	
	//depth
	const depthTexture = gl.createTexture()
	
	gl.bindTexture(gl.TEXTURE_2D, depthTexture)
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT24, // internal format
		size,   // width
		size,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,           // type
		null)              // data
		
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	 
	const framebuffer = gl.createFramebuffer()
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
	
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.COLOR_ATTACHMENT0,  // attachment point
		gl.TEXTURE_2D,        // texture target
		colorTexture,         // texture
		0)
	
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0) 
	
	
	
	const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
	 
	if (status != gl.FRAMEBUFFER_COMPLETE) {
		console.log('fb status: ' + status.toString(16))
		
	}
	
	//clean up
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	gl.bindTexture(gl.TEXTURE_2D, null)
	
	
	return {
		texture: colorTexture,
		buffer: framebuffer,
		size: size
	}
	
}

















