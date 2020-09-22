//Vec2
function Vec2(x,y){
	
	this.x = x || 0;
	this.y = y || 0;
}

Vec2.prototype = {
	set:function( x, y ){
		
		this.x = x || 0
		this.y = y || 0
		
		return this
		
	},
	zero:function( ){
		
		this.x = 0
		this.y = 0
		
		return this
		
	},
	clone: function(){
		return new Vec2( this.x, this.y );
	},
	copy: function( v){
		this.x = v.x;
		this.y = v.y;
		return this;
	},
	add: function( v ){
		
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	addVectors: function( v0, v1 ){
		this.x = v0.x + v1.x;
		this.y = v0.y + v1.y;
		return this;
	},
	addScalar: function( s ){
		
		this.x += s;
		this.y += s;
		return this;
	},
	sub: function( v ){
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	subVectors: function( v0, v1 ){
		this.x = v0.x - v1.x;
		this.y = v0.y - v1.y;
		return this;
	},
	subScalar: function( s ){
		this.x -= s;
		this.y -= s;
		return this;
	},
	length: function(){
		return Math.sqrt( this.x*this.x + this.y*this.y);
	},
	lengthSq: function(){
		return this.x*this.x + this.y*this.y;
	},
	multiplyScalar: function(s){
		
		this.x *= s;
		this.y *= s;
		return this;
	},
	scale: function(s){
		
		this.x *= s;
		this.y *= s;
		return this;
	},
	normalize: function(){
		var l = this.length() || 1;
		this.x /= l;
		this.y /= l;
		return this;
	},
	clampLength:function(max){
		
		var l = this.length();
		
		if(l===0){
			
			return this
			
		}
		var m = Math.min( max, l);
		this.x = this.x / l * m;
		this.y = this.y / l * m;
		return this;
	},
	lerp: function ( v, alpha ) {

		//this.x += ( v.x - this.x ) * alpha;
		//this.y += ( v.y - this.y ) * alpha;
		this.x = (1-alpha) * this.x + alpha * v.x
		this.y = (1-alpha) * this.y + alpha * v.y
		return this;

	},
	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	},
	rotate: function(angle){
		
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var x = this.x * cos - this.y * sin;
		var y = this.x * sin + this.y * cos;
		
		this.x = x;
		this.y = y;
		
		return this;
	},
	rotateAround: function(origin, angle) {
		
		var cos = Math.cos(angle)
		var sin = Math.sin(angle)
		var dx = this.x - origin.x
		var dy = this.y - origin.y
		
		this.x = dx*cos - dy*sin + origin.x
		this.y = dx*sin + dy*cos + origin.y
		
		return this
	},
	dot: function ( v ) {

		return this.x * v.x + this.y * v.y;

	},
	reflect: function( normal ){
		
		var s =  2 * this.dot( normal )
		var v = normal.clone().scale( s ) 
		
		return v.sub( this );
	},
	negate: function () {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	},
	normal: function(){
		
		return new Vec2( -this.y, this.x).normalize();
	},
	normalFromVectors:function(v0, v1) {
		// perpendicular
		var nx = v0.y - v1.y, ny = v1.x - v0.x;
		// normalize
		var len = 1.0 / Math.sqrt(nx * nx + ny * ny);
		this.x = nx * len;
		this.y = ny * len;
		return this;
	},
	scaleVector: function(v, s) {
		this.x = v.x * s;
		this.y = v.y * s;
		return this;
	},
	perp: function(){
		
		return new Vec2( -this.y, this.x);
	},
	setLength: function ( length ) {

		return this.normalize().multiplyScalar( length );

	},
	project: function ( v ) {

		var scalar = v.dot( this ) / v.lengthSq();

		return this.copy( v ).multiplyScalar( scalar );

	},
	cross:function(v){
		
		return this.x*v.y - this.y*v.x;
	},
	angle:function(v) {
		return Math.atan2(this.x*v.y-this.y*v.x,this.x*v.x+this.y*v.y)
	},
	angle2:function( left, right ) {
		
		return left.clone().sub(this).angle( right.clone().sub(this) )
	},
	angleTo: function( v ){
		var l = this.length() * v.length()
		if(l===0) return 0
		return Math.acos( this.dot( v ) / l )
	},
	fromAngleAndMagnitude: function(  angle, mag ){
	
		 this.x = mag*Math.cos(angle);
		 this.y = mag*Math.sin(angle);
		
		 return this;
	},
	distanceTo: function(  v ){
	
	 var dx = v.x - this.x
	 var dy = v.y - this.y

	 return Math.sqrt(dx*dx + dy*dy)
	},
	distanceToSq: function(  v ){
	
	 var dx = v.x - this.x
	 var dy = v.y - this.y

	 return dx*dx + dy*dy
	},
	equals:function(v){
		
		return this.x === v.x && this.y === v.y
	},
	between: function(v1,v2){
		
		return v1.cross(this) * v1.cross(v2) >=0 && v2.cross(this)*v2.cross(v1) >= 0
	},
	applyMatrix3: function(m) {
        var x = this.x,
            y = this.y;
        var e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6];
        this.y = e[1] * x + e[4] * y + e[7];
        return this;
      },
      lerp: function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
      },
      lerpVectors: function(a, v, alpha) {
		  
		  var b = new Vec2().copy(a)
        b.x += (v.x - b.x) * alpha;
        b.y += (v.y - b.y) * alpha;
        return b;
      },
      rotateAround: function(center, angle) {
        var c = Math.cos(angle),
            s = Math.sin(angle);
        var x = this.x - center.x;
        var y = this.y - center.y;
        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;
        return this;
      },
      clamp: function(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        return this;
      },
      fromArray:function(a){
		  return new Vec2(a[0],a[1])
	  },
	  toArray:function(){
		  return [ this.x, this.y]
	  }
	
}

function Matrix3(){

  this.elements = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
}
Matrix3.prototype ={
	
	set:function(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
		
        var te = this.elements;
        te[0] = m00;
        te[3] = m01;
        te[6] = m02;
        te[1] = m10;
        te[4] = m11;
        te[7] = m12;
        te[2] = m20;
        te[5] = m21;
        te[8] = m22;
        return this;
    },
    identity: function() {
		
        this.set(1, 0, 0, 0, 1, 0, 0, 0, 1)
        return this;
    },
    copy: function(matrix) {
        var me = matrix.elements;
        var te = this.elements;
        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        te[4] = me[4];
        te[5] = me[5];
        te[6] = me[6];
        te[7] = me[7];
        te[8] = me[8];
        return this;
    },
    clone: function() {
        return new Matrix3().fromArray(this.elements);
    },
    fromArray: function (array) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var te = this.elements;
        var i;

        for (i = 0; i < 9; ++i) {
          te[i] = array[i + offset];
        }

        return this;
    },
	multiplyMatrices: function(a, b) {
        var ae = a.elements;
        var be = b.elements;
        var te = this.elements;
        var a11 = ae[0],
            a12 = ae[3],
            a13 = ae[6];
        var a21 = ae[1],
            a22 = ae[4],
            a23 = ae[7];
        var a31 = ae[2],
            a32 = ae[5],
            a33 = ae[8];
        var b11 = be[0],
            b12 = be[3],
            b13 = be[6];
        var b21 = be[1],
            b22 = be[4],
            b23 = be[7];
        var b31 = be[2],
            b32 = be[5],
            b33 = be[8];
        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;
        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;
        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;
        return this;
      },
      multiply: function(m) {
        return this.multiplyMatrices(this, m)
      },
      translate: function(tx, ty) {
        var te = this.elements;
        te[0] += tx * te[2];
        te[3] += tx * te[5];
        te[6] += tx * te[8];
        te[1] += ty * te[2];
        te[4] += ty * te[5];
        te[7] += ty * te[8];
        return this;
      },
      rotate: function(theta) {
        var c = Math.cos(theta);
        var s = Math.sin(theta);
        var te = this.elements;
        var a11 = te[0],
            a12 = te[3],
            a13 = te[6];
        var a21 = te[1],
            a22 = te[4],
            a23 = te[7];
        te[0] = c * a11 + s * a21;
        te[3] = c * a12 + s * a22;
        te[6] = c * a13 + s * a23;
        te[1] = -s * a11 + c * a21;
        te[4] = -s * a12 + c * a22;
        te[7] = -s * a13 + c * a23;
        return this;
      },
      scale: function(sx, sy) {
        var te = this.elements;
        te[0] *= sx;
        te[3] *= sx;
        te[6] *= sx;
        te[1] *= sy;
        te[4] *= sy;
        te[7] *= sy;
        return this;
      },
      transpose: function() {
        var me = this.elements;
        var t;
        t = me[1];
        me[1] = me[3];
        me[3] = t;
        t = me[2];
        me[2] = me[6];
        me[6] = t;
        t = me[5];
        me[5] = me[7];
        me[7] = t;
        return this;
      },
      getInverse: function(matrix) {
        var me = matrix.elements;
        var te = this.elements;
        var n11 = me[0],
            n21 = me[1],
            n31 = me[2];
        var n12 = me[3],
            n22 = me[4],
            n32 = me[5];
        var n13 = me[6],
            n23 = me[7],
            n33 = me[8];
        var t11 = n33 * n22 - n32 * n23;
        var t12 = n32 * n13 - n33 * n12;
        var t13 = n23 * n12 - n22 * n13;
        var det = n11 * t11 + n21 * t12 + n31 * t13;
        var invDet;

        if (det !== 0) {
          invDet = 1.0 / det;
          te[0] = t11 * invDet;
          te[1] = (n31 * n23 - n33 * n21) * invDet;
          te[2] = (n32 * n21 - n31 * n22) * invDet;
          te[3] = t12 * invDet;
          te[4] = (n33 * n11 - n31 * n13) * invDet;
          te[5] = (n31 * n12 - n32 * n11) * invDet;
          te[6] = t13 * invDet;
          te[7] = (n21 * n13 - n23 * n11) * invDet;
          te[8] = (n22 * n11 - n21 * n12) * invDet;
        } else {
          console.error("Can't invert matrix, determinant is zero", matrix);
          this.identity();
        }

        return this;
      },
      determinant: function () {
        var te = this.elements;
        var a = te[0],
            b = te[1],
            c = te[2];
        var d = te[3],
            e = te[4],
            f = te[5];
        var g = te[6],
            h = te[7],
            i = te[8];
        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
      }
}


























