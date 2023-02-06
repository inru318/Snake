"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// A matrix to transform the positions by
uniform mat3 u_matrix;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function main() {
 
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  gl.strokeStyle='#FFFFFF';
  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // First let's make some variables
  // to hold the translation,
  var mx = 500,my = 500;
  var translation = [mx, my];
  var angle = 270;
  var rotationInRadians = angle * Math.PI / 180;
  var scale = [0.85, 0.85];
  var color = [Math.random(), Math.random(), Math.random(), 1];
  var speed = 0 ;
  var body = 0 ;
  var foodX =[];
  var foodY =[];
  var bombX = [];
  var bombY = [];
  var foodcolor = [];
  var score = 0;
  var heart = 5;
  var background = document.getElementById("backgroundmusic");  
  var coin = document.getElementById("eatmusic");
  var Over = document.getElementById("gameovermusic");
  var wall = document.getElementById("wallmusic");
  var bomb = document.getElementById("bombmusic");
  var refreashtime = 0;
  document.getElementById("score").innerHTML = "Score : " + score ;


  //set eat food  and bomb
    for(var k = 0 ; k < 8 ; k++){
      foodcolor[k] = [Math.random(), Math.random(), Math.random(), 1]
      foodX[k] = randomInt(1200);
      foodY[k] = randomInt(400);
    }
    for(var k = 0 ; k < 20 ; k++){
      bombX[k] = randomInt(1200);
      bombY[k] = randomInt(400);
    }


  // set keyboard event
  document.addEventListener('keydown',function(e){
    if(e.code =="ArrowLeft"){  
      angle+= 2;
      rotationInRadians = angle * Math.PI / 180;
    }
    else if(e.code =="ArrowRight"){
      angle-=2;
      rotationInRadians = angle * Math.PI / 180;
    }
    if(e.code == "ArrowUp"){
      speed++;
      if(speed > 3){
        speed = 3 ;
      }
    }
    else if(e.code == "ArrowDown"){
      speed--;
      if(speed < 0 ){
        speed = 0 ;
      }
    }
  })
   
  drawScene();


  // Draw the scene.
  function drawScene(time) {

    background.play();
    setGeometry(gl);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Set the color.
    gl.uniform4fv(colorLocation, color);


    if(translation[0]<27){
      translation[0] = 27;
      wall.play();
    }
    if(translation[0]>1497){
      translation[0] = 1497;
      wall.play();
    }

    if(translation[1]<27){
      translation[1] = 27;
      wall.play();
    }
    if(translation[1]>613){
      translation[1] = 613;
      wall.play();
    }

   


    for(var kk = 0 ; kk < 8 ; kk++){
      //var cal = Math.pow(translation[0]+ 70 - foodX[kk],2)+Math.pow(translation[1]+70 - foodY[kk],2); 
      if( translation[0]  > foodX[kk] && translation[0] < foodX[kk] + 20 && translation[1]  > foodY[kk] && translation[1] < foodY[kk]+20 ){
          coin.play();
          foodX.splice(kk,1);
          foodY.splice(kk,1);
          foodcolor.splice(kk,1);
          foodcolor[7] = [Math.random(), Math.random(), Math.random(), 1]
          foodX[7] = randomInt(1200);
          foodY[7] = randomInt(400);
          body++;
          score++;
          document.getElementById("score").innerHTML = "Score : " + score ;
      }
    }

    
    for(var kk = 0 ; kk < 20 ; kk++){
      //var cal = Math.pow(translation[0]+ 70 - foodX[kk],2)+Math.pow(translation[1]+70 - foodY[kk],2); 
      if( translation[0]  > bombX[kk] && translation[0] < bombX[kk] + 13 && translation[1]  > bombY[kk] && translation[1] < bombY[kk]+13 ){
          bomb.play(); 
          bombX.splice(kk,1);
          bombY.splice(kk,1);
          bombX[7] = randomInt(1200);
          bombY[7] = randomInt(400);
          var x=document.getElementById("heart"+ heart);
          x.style.color="black";
          heart--;
      }
    }

    if(heart==0){
      if(refreashtime < 5){
        Over.play();
      }
      if(refreashtime> 200){
        Over.pause();
       
      }
      document.getElementById("gameover").innerHTML = "Game Over!!!";
      speed = 0;
      refreashtime++;
      if(refreashtime > 500){
        window.location.reload();
      }
    }

    // Compute the matrices
    var translationMatrix = m3.translation(translation[0], translation[1]);
    var rotationMatrix = m3.rotation(rotationInRadians);
    var scaleMatrix = m3.scaling(scale[0], scale[1]);
  
    // Starting Matrix.(Snack head)
    var matrix = m3.identity();
    matrix = m3.multiply(matrix, translationMatrix);
    matrix = m3.multiply(matrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);
    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);

    //Snack Body
    for (var i = 0; i < body ; ++i) {
      // Rotation body.
      rotationMatrix = m3.rotation(Math.sin(time));

      // 要改的
      translationMatrix = m3.translation(40, 40);
      // Multiply the matrices.
      matrix = m3.multiply(matrix, translationMatrix);
      matrix = m3.multiply(matrix, rotationMatrix);
      matrix = m3.multiply(matrix, scaleMatrix);

      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      // Draw the geometry.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 3;
      gl.drawArrays(primitiveType, offset, count);
    }    
 
    drawedge();
   
  }


  function drawedge(){

      setGeometryedge(gl);
      var translationMatrix = m3.translation(10,10);
      var rotationMatrix = m3.rotation(0);
      var scaleMatrix = m3.scaling(scale[0], scale[1]);

      var matrix = m3.identity();
      matrix = m3.multiply(matrix, translationMatrix);
      matrix = m3.multiply(matrix, rotationMatrix);
      matrix = m3.multiply(matrix, scaleMatrix);
      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 24;
      gl.drawArrays(primitiveType, offset, count);
      draweat(foodX,foodY,foodcolor);
  }

  function draweat(foodX,foodY,foodcolor) {

      var matrix = m3.identity();
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      for (var ii = 0; ii < 8; ++ii) {
        gl.uniform4fv(colorLocation,foodcolor[ii]);
        // Put a rectangle in the position buffer
        setGeometryeat(
            gl, foodX[ii], foodY[ii] , 20, 20); 
        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
      }
      drawbomb(bombX,bombY);
  }

  function drawbomb(bombX,bombY){

    var matrix = m3.identity();
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
   

    for( var k = 0 ; k < 20 ; ++k){
      var colorb = [Math.random(), Math.random(), Math.random(), 1]
      gl.uniform4fv(colorLocation,colorb);
      setGeometryeat(
        gl, bombX[k], bombY[k] , 13, 13 ); 
      // Draw the rectangle.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }

  }

  function randomInt(range) {
    return Math.floor(Math.random() * range)+150;
  }

  function render(time) {
    time *= 0.002;
    translation[0] = translation[0]+Math.cos((angle+135) * Math.PI / 180)*speed;
    translation[1] = translation[1]-Math.sin((angle+135) * Math.PI / 180)*speed;
    drawScene(time);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  }

// Fill the current ARRAY_BUFFER buffer
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          80, 0,
          0, 80,
      ]),
      gl.STATIC_DRAW);

}

function setGeometryedge(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        //左邊
        0, 0,
        20, 0,
        0, 730,
        0, 730,
        20, 0,
        20, 730,

        //上面
        20, 0,
        20, 20,
        1750, 0,
        20, 20,
        1750, 0,
        1750, 20,

        //下面
        20, 710,
        20, 730,
        1750, 710,
        20, 730,
        1750, 710,
        1750, 730,

       //右邊
        1750, 0,
        1770, 0,
        1750, 730,
        1750, 730,
        1770, 730,
        1770, 0,

      ]),
      gl.STATIC_DRAW);
}

function setGeometryeat(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

var m3 = {
  identity: function identity() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function translation(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function rotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function scaling(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function multiply(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },


  
};

main();
