let video;
let poseNet;
let nose;
let fruits = [];
let score = 0;
let gameOver = false;
let startTime;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    startTime = millis();

    // Generate new fruits every second
    setInterval(function() {
        if (!gameOver) {
            let newFruit = new Fruit(random(width), height, random(3, 6));
            fruits.push(newFruit);
        }
    }, 1000);
}

function gotPoses(poses) {
    if (poses.length > 0) {
        nose = poses[0].pose.keypoints[0].position; // Nose position
    }
}

function modelLoaded() {
    console.log('poseNet ready');
}

function draw() {
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0);

    if (nose) {
        // Draw ellipse on the nose
        fill(14, 120, 33);
        ellipse(nose.x, nose.y, 50, 50);

        // Update and display each fruit
        for (let i = fruits.length - 1; i >= 0; i--) {
            fruits[i].update();
            fruits[i].display();

            // Check for collision with the slicing motion
            if (fruits[i].checkSlice(nose)) {
                fruits.splice(i, 1); // Remove sliced fruit
                score++; // Increment score
            }
        }
    }

    // Reset transformation to default for UI elements
    resetMatrix();

    // Display score without mirroring
    textSize(32);
    fill(255, 0, 0); // Set the fill color to red
    textAlign(LEFT); // Set alignment to left for default coordinate system
    text("Score: " + score, 10, 30);

    // Check for game over condition
    if (score >= 10 || millis() - startTime >= 30000) {
        gameOver = true;
        textSize(64);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);
    }
}

// Fruit class definition
class Fruit {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    update() {
        // Move the fruit
        this.y -= this.speed;

        // Remove the fruit if it goes off screen
        if (this.y < 0) {
            fruits.splice(fruits.indexOf(this), 1);
        }
    }

    display() {
        // Draw the fruit
        fill(255, 0, 0);
        ellipse(this.x, this.y, 50, 50);
    }

    checkSlice(nose) {
        // Check if the slicing motion intersects with the fruit
        // For simplicity, assume slicing motion occurs when nose is above fruit
        if (nose.y < this.y && dist(nose.x, nose.y, this.x, this.y) < 25) {
            return true;
        } else {
            return false;
        }
    }
}
