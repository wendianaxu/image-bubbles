let img, imgRatio, canvasRatio, wOffset, hOffset, textInput, textValue, font, radio, textX, textY;
let textPoints = [];
let agents = [];
let newImage = true;
let changeColorOn = true;
let mouseRadius = 50;

const minSize = 1; 
const maxSize = 5;
const noiseScale = 0.01;


function preload() {
  font = loadFont("imprima.ttf");
}

function setup() {
  createCanvas(800, 600);
  wOffset = width/15;
  hOffset = height/15;
  canvasRatio = (width - wOffset) / (height - hOffset);

  colorMode(RGB, 255, 255, 255, 1);

  // for image input
  img = loadImage("example_image.jpg"); // load example image
  const imageInput = createFileInput(handleFile);
  imageInput.position(25, 60);

  // for text input
  textInput = createInput();
  textInput.position(415, 60);
  textX = wOffset;
  textY = height/2;

  // radio button for coloring with randomness/noise
  radio = createRadio();
  radio.option('Randomness');
  radio.option('Noise');
  radio.selected('Randomness');
  radio.position(790, 170);

  // mouse radius size slider
  radiusSlider = createSlider(1, 100, 50, 10);
  radiusSlider.position(800, 250);
  
}

function draw() {
  background(color("#f8f6f0"));

  textInput.input(updateText); // update text points when text input is changed

  mouseRadius = radiusSlider.value();
  
  // draw uploaded image as points
  if (newImage){
      
      // create agent array from image
      imageToAgents();
      
      // prevent the drawing loop from creating agents again before new image is loaded
      newImage = false;
    }

    // draw agents
    for (i = 0; i < agents.length; i++){
      const agent = agents[i];
      const mouse = createVector(mouseX - wOffset, mouseY - hOffset);
      agent.update();
      agent.draw();
      
      agent.seek(agent.originalPosition);
      agent.flee(mouse, 0);

      if (changeColorOn){
        agent.changeColor(mouse);
      }
      
    }

    // if there is text input
    if (textPoints.length !== 0){
      // change color of image points that are closest to each text point
      const closestAgents = findClosestAgent();
      for (let i = 0; i < closestAgents.length; i++){
        const agent = closestAgents[i];
        agent.changeColor(agent.currentPosition);
      }
    }

}

function handleFile(file){
  if (file.type === "image"){
    loadImage(file.data, imageData => { img = imageData;
      newImage = true;});
  }
}

function imageToAgents(){ // create agent array from image
  agents = [];

  imgRatio = img.width/img.height;

  // resize image
  if (imgRatio < canvasRatio){ // if image is taller than canvas
      img.resize(0, height*0.9 - hOffset);
  } else { // if image is wider than canvas
      img.resize(width*0.9 - wOffset, 0);
  }

  // create agents
  for (let x = 0; x < img.width; x += 10){
    for (let y = 0; y < img.height; y += 10){
      const c = img.get(x, y); // get color on current position
      const agent = new Agent(x, y, c);
      agents.push(agent); 
    }
  }
}

function updateText(){ // convert input text to points
  textValue = textInput.value();
  textPoints = font.textToPoints(textValue, textX, textY, 170);
}

function findClosestAgent(){ // find the agent (image point) that's the closest to each text point
    let closestAgents = [];
    for (let i = 0; i < textPoints.length; i++) {
      let closestIndex = 0;
      let closestDist = Infinity;
      for (let j = 0; j < agents.length; j++){
        const textPoint = textPoints[i];
        const agent = agents[j];
        // distance between current text point and current agent
        const distance = dist(agent.originalPosition.x, agent.originalPosition.y, textPoint.x, textPoint.y);
        if (distance < closestDist) {
          closestIndex = j;
          closestDist = distance;
        }
      }
      const closestAgent = agents[closestIndex];
      closestAgents.push(closestAgent);
    }
    return closestAgents;
  }

class Agent{
  constructor(x, y, c){
    this.originalPosition = createVector(x, y);
    this.currentPosition = createVector(x, y);
    this.color = color(red(c), green(c), blue(c), 0.8);

    // point weight and position offset based on noise
    this.noiseValue = noise(this.originalPosition.x * noiseScale, this.originalPosition.y * noiseScale);
    this.weight = map(this.noiseValue, 0, minSize, maxSize, 20);
    this.offset = map(this.noiseValue, 0, 1, 0, 20);

    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.maxSpeedSeek = random(1, 8);
    this.maxForceSeek = random(0.09, 0.1);
    this.maxSpeedFlee = random(1, 3);
    this.maxForceFlee = random(0.05, 0.5);

    //this.closestPoint; // closest point in textPoints array

  }

  applyForce(force){
    this.acceleration.add(force);
  }

  changeColor(mouse){ // change the color of points within the mouse radius
    const vec = p5.Vector.sub(this.currentPosition, mouse);
    const dist = vec.magSq();

    if (dist <= mouseRadius * mouseRadius){
      const c = this.color; 
      let h = floor(hue(c));
      let s = floor(saturation(c));
      let b = floor(brightness(c));

      if (radio.value() === "Noise"){
        h = floor(map(this.noiseValue, 0, 1, h-8, h+8)); // change hue within a range (noise)
      } else{
        h = floor(random(h - 8, h + 8)); // change hue within a range (random)
      }
      
      h = (h + 360) % 360 // wrap hue between 0 and 360

      s += floor(map(dist, 0, img.width * img.width, 5, 0)); // increase saturation as a function of distance to mouse
      s = constrain(s, 0, 80) // constrain saturation between 0 and 80

      b += floor(map(dist, 0, img.width * img.width, 10, 0)); // increase brightness as a function of distance to mouse
      b = constrain(b, 0, 80) // constrain brightness between 0 and 80

      this.color = color(`hsba(${h}, ${s}%, ${b}%, 0.8)`);
    }
  }

  findColor(){ // find the point with the most different color from this point (not working)
    const currentColor = createVector(red(this.color), green(this.color), blue(this.color));
    let maxDist = 0;
    let maxDistIndex;
    for (i = 0; i < agents.length; i++){
      const agent = agents[i];
      const targetColor = createVector(red(agent.color), green(agent.color), blue(agent.color));
      const distance = p5.Vector.sub(targetColor, currentColor).magSq();
      if (maxDist < distance){
        maxDist = distance;
        maxDistIndex = i;
      }
    }
    const targetPosition = agents[maxDistIndex].currentPosition;
    this.seek(targetPosition);
  }


  seek(target){
    const offsetTarget = createVector(target.x + this.offset, target.y + this.offset)
    const vec = p5.Vector.sub(offsetTarget, this.currentPosition);

    // distance between target and agent
    const dist = vec.magSq();
    // map speed to distance within circle of given radius
    let adjusted_speed = map(dist, 0, mouseRadius * mouseRadius, 0, this.maxSpeedSeek);
    // constrain speed for targets outside the circle
    adjusted_speed = constrain(adjusted_speed, 0, this.maxSpeedSeek);

    const desired_v = vec.normalize().mult(adjusted_speed);

    let steering_force = p5.Vector.sub(desired_v, this.velocity); 

    // limit force
    steering_force = steering_force.limit(this.maxForceSeek);

    this.applyForce(steering_force);

  }

  flee(target, limitForce){
    const vec = p5.Vector.sub(this.currentPosition, target);
    if (vec.magSq() <= mouseRadius * mouseRadius){

      // distance between target and agent
      const dist = vec.magSq();
      // map speed to distance within circle of given radius
      let adjusted_speed = map(dist, 0, mouseRadius * mouseRadius, 1, this.maxSpeedFlee);
      // constrain speed for targets outside the circle
      adjusted_speed = constrain(adjusted_speed, 0, this.maxSpeedFlee);

      const desired_v = vec.normalize().mult(adjusted_speed);
      let steering_force = p5.Vector.sub(desired_v, this.velocity); 

      // limit force
      if (limitForce){
        steering_force = steering_force.limit(this.maxForceFlee);
      }

      this.applyForce(steering_force);
    }
    
  }

  update(){
    this.velocity.add(this.acceleration);
    this.currentPosition.add(this.velocity);
    this.acceleration.mult(0);

  }

  draw(){
    push();
    translate(wOffset, hOffset);
    stroke(this.color);
    strokeWeight(this.weight);
    point(this.currentPosition.x, this.currentPosition.y);
    pop();
  }
}

function keyTyped(){
  if (key === 'r'){ // reset agents
    imageToAgents();
  }

  if (key === 'c'){ // whether or not to change color with mouse hover
    changeColorOn = !changeColorOn;
  }

}




  
  