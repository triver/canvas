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

