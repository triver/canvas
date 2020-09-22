function lookAtCamera( ){
	
	const HALF_PI = Math.PI/2
	
	const camera = {
		lambda: 0,
		phi: 0,
		position: [0,0,0],
		target: [0,0,0],
		matrix: mat4.create(),
		up: [0,1,0],
		distance: 1,
		setLambda:function(lambda){ this.lambda = lambda }, 
		setPhi:function(phi){ this.phi = phi }, 
		setDistance:function(distance){ this.distance = distance }, 
		setTarget:function(target){ this.target = target },
		updateStatic: function(){ this.updateDynamic( this.target, 0 ) }, 
		updateDynamic: function( targetPos, angle ){
			
			const hasTarget = !!targetPos
			const hasAngle = !(typeof angle == 'undefined') 
			
			if( hasAngle){
			
				const lambda = angle + this.lambda
				const phi = -HALF_PI + this.phi
				
				const sinphi = Math.sin( phi )
				
				const x = sinphi * Math.sin( lambda )
				const y = Math.cos( phi ) 
				const z = sinphi * Math.cos( lambda ) 
			
				vec3.set( this.position,
					x * this.distance, 
					y * this.distance, 
					z * this.distance)
				
			}
			
			if( hasTarget ){
				
				vec3.add( this.position, this.position, targetPos )
			}else{
				targetPos = this.target
			}
			
			mat4.lookAt( this.matrix, this.position, targetPos , this.up )
			
			
		}
	}
	
	return camera
}


function freeTarget( mSpeed, rSpeed, h ){

	const target = {
	
	position: vec3.fromValues( 0, 0, 0),
	matrix: mat4.create(),
	speed: mSpeed || 0.05,
	rotSpeed: rSpeed || 0.05,
	angle:0,
	directionMatrix: mat4.create(),
	direction: vec3.fromValues( 0, 0, 1),
	turn:function(dir){
		
		this.angle -= dir*this.rotSpeed
		
		this.direction[0] = Math.sin( this.angle )
		this.direction[2] = Math.cos( this.angle )
	},
	move:function(dir, bound){
		
		bound = bound || 30
		
		this.position[0] += this.direction[0] * dir * this.speed
		this.position[2] += this.direction[2] * dir * this.speed
		
		//check bounds
		if( vec3.squaredLength( this.position ) > bound*bound ){
			
			const newPos = vec3.fromValues( this.position[0], 0, this.position[2] )
			vec3.normalize( newPos, newPos)
			vec3.scale( newPos, newPos, bound )
			
			this.position[0] = newPos[0]
			this.position[2] = newPos[2]
		}
	
	},
	updateMatrix: function(){
		
		const m = mat4.create()
		const mr = mat4.create()
		const mt = mat4.create()
		
		mat4.fromTranslation( mt, this.position)
		mat4.fromYRotation(mr, this.angle )
		mat4.multiply( this.matrix, mt, mr)
		this.directionMatrix = mr
	}
}

return target
}
