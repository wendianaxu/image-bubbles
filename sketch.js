let img, imgRatio, canvasRatio, wOffset, hOffset, textInput, textValue, font;
let textPoints = [];
let agents = [];
let newImage = true;
const mouseRadius = 50;
const noiseScale = 0.01;

function preload() {
  font = loadFont("rubik.ttf");
}

function setup() {
  createCanvas(800, 600);
  wOffset = width/15;
  hOffset = height/15;
  canvasRatio = (width - wOffset) / (height - hOffset);

  colorMode(RGB, 255, 255, 255, 1);
  //colorMode(HSB, 360, 100, 100, 1)
  //blendMode(BURN);

  // for image input
  img = loadImage("example_image.jpg"); // load example image
  const imageInput = createFileInput(handleFile);
  imageInput.position(25, 60);

  // for text input
  textInput = createInput();
  textInput.position(400, 60);

  
}

function draw() {
  background(color("#f8f6f0"));

  textInput.input(updateText); // update text points when text input is changed

  // draw text points
/*   if (textPoints){ 
    // draw text
    for (i = 0; i < textPoints.length; i++){
      const pnt = textPoints[i];
      strokeWeight(10);
      point(pnt.x, pnt.y); 
    }
  } */
  
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
      const mouse = createVector(mouseX, mouseY);
      agent.update();
      agent.draw();

      if (textPoints.length !== 0){
        agent.formText(); 
        //agent.findColor();
      }
      
      agent.seek(agent.originalPosition);
      agent.flee(mouse, 0);
      agent.changeColor(mouse);
      
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

function updateText(){ // convert input text to points and set up the agents for fleeing from them
  textValue = this.value();
  textPoints = font.textToPoints(textValue, wOffset, height/2, 150);
  for (i = 0; i < agents.length; i++){
    const agent = agents[i];
    agent.getClosestPoint(); // for each agent, locate the point in textPoints to flee from
  }
}



class Agent{
  constructor(x, y, c){
    this.originalPosition = createVector(x, y);
    this.currentPosition = createVector(x, y);
    this.color = color(red(c), green(c), blue(c), 0.8);

    // point weight and position offset based on noise
    const noiseValue = noise(this.originalPosition.x * noiseScale, this.originalPosition.y * noiseScale);
    this.weight = map(noiseValue, 0, 1, 5, 20);
    this.offset = map(noiseValue, 0, 1, 0, 20);

    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.maxSpeedSeek = random(1, 8);
    this.maxForceSeek = random(0.09, 0.1);
    this.maxSpeedFlee = random(1, 3);
    this.maxForceFlee = random(0.05, 0.5);

    this.closestPoint; // closest point in textPoints array

  }

  applyForce(force){
    this.acceleration.add(force);
  }

  changeColor(mouse){ // randomly change the color of points within the mouse radius
    const vec = p5.Vector.sub(this.currentPosition, mouse);
    if (vec.magSq() <= mouseRadius * mouseRadius){
      this.color = color(random(255), random(255), random(255), 0.8);
    }
  }

  getClosestPoint(){ // get the point in the textPoints array that's the closest to this point
    let closestIndex = 0;
    let closestDist = Infinity;
    for (let i = 0; i < textPoints.length; i++) {
      // distance between current point and all text points
      const distance = dist(this.originalPosition.x, this.originalPosition.y, textPoints[i].x, textPoints[i].y);
      if (distance < closestDist) {
        closestIndex = i;
        closestDist = distance;
      }
    }
    this.closestPoint = textPoints[closestIndex];
  }

  formText(){ // make agents flee from text input
    const target = createVector(this.closestPoint.x, this.closestPoint.y);
    this.flee(target, 1);
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

  
}




  
  