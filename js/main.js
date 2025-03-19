const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const window_height = 800;
const window_width = 1000;
canvas.height = window_height;
canvas.width = window_width;

const maxCircles = 10;  // Permitir más de un pez, pero solo uno puede estar atrapado
let fishGenerationInterval = 1500;
let fishGenerationTimer;

startFishGeneration();  // Iniciar la generación gradual de peces

function startFishGeneration() {
    fishGenerationTimer = setInterval(spawnCircles, fishGenerationInterval);  // Generar un pez cada 'fishGenerationInterval' ms
}

document.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;

    const minHeight = 190;
    const maxHeight = window_height - 20;
    ceboPosY = Math.min(Math.max(mouseY, minHeight), maxHeight);  // Restringir la posición del cebo
});

const background = new Image();
background.src = "Media/Images/Fondo_mar.png";
background.onload = drawBackground;

function drawBackground() {
    ctx.drawImage(background, 0, 0, window_width, window_height);
}

// Estilos del canvas y página
canvas.style.display = "block";
canvas.style.margin = "auto";
canvas.style.border = "5px solid #fff";
canvas.style.borderRadius = "15px";
canvas.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.3)";

document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.height = "100vh";
document.body.style.background = "linear-gradient(135deg, #1a1a2e, #16213e)";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.appendChild(canvas);

let totalCircles = 10;
let removedCircles = 0;
let circles = [];
let timeElapsed = 0; 
let timer;

const explosionSound = new Audio("Media/Audio/collision.mp3");

const stats = document.createElement("div");
stats.style.color = "#fff";
stats.style.fontSize = "20px";
stats.style.marginBottom = "10px";
stats.style.padding = "10px";
stats.style.borderRadius = "10px";
stats.style.background = "rgba(0, 0, 0, 0.5)";
stats.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.2)";
document.body.insertBefore(stats, canvas);

const messageDiv = document.createElement("div");
messageDiv.style.color = "#fff";
messageDiv.style.fontSize = "24px";
messageDiv.style.marginTop = "10px";
messageDiv.style.padding = "10px";
messageDiv.style.borderRadius = "10px";
messageDiv.style.background = "rgba(255, 0, 0, 0.6)";
messageDiv.style.display = "none";
document.body.appendChild(messageDiv);

const retryButton = document.createElement("button");
retryButton.innerText = "Reintentar";
retryButton.style.display = "none";
retryButton.style.marginTop = "15px";
retryButton.style.padding = "10px 20px";
retryButton.style.border = "none";
retryButton.style.borderRadius = "10px";
retryButton.style.background = "#ff4757";
retryButton.style.color = "#fff";
retryButton.style.fontSize = "18px";
retryButton.style.cursor = "pointer";
retryButton.style.transition = "0.3s";
retryButton.addEventListener("mouseover", () => retryButton.style.background = "#e84118");
retryButton.addEventListener("mouseout", () => retryButton.style.background = "#ff4757");
document.body.appendChild(retryButton);

retryButton.addEventListener("click", () => {
    spawnCircles();
    retryButton.style.display = "none";
    messageDiv.style.display = "none";
});

const cebo = new Image();
cebo.src = "Media/Images/cebo.png"; 
let ceboPosY = window_height / 2;  

class Circle {
    constructor(radius, speed, imageSrc) {
        this.posX = Math.random() > 0.5 ? -radius : window_width + radius;
        this.posY = Math.random() * (window_height / 2) + (window_height / 2); 
        this.radius = radius;
        this.speed = speed;
        this.dx = this.posX < 0 ? speed : -speed;
        this.dy = 0.1;  
        this.image = new Image();
        this.image.src = imageSrc;
        this.attached = false; 
    }

    draw() {
        ctx.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
    }

    update() {
        if (this.attached) {
            this.posX = window_width / 2;  
            this.posY = ceboPosY;  
        } else {
            this.posX += this.dx;
            this.posY += this.dy; 
            if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
                this.dy = -this.dy; 
            }
        }

        if (this.posX + this.radius < 0 || this.posX - this.radius > window_width) {
            this.posX = Math.random() > 0.5 ? -this.radius : window_width + this.radius;
            this.posY = Math.random() * (window_height / 2) + (window_height / 2);
        }
    }
}

function spawnCircles() {
    if (circles.length < maxCircles) {  // Permitir generar nuevos peces sin detener la generación
        const radius = Math.random() * 20 + 30; 
        const constantSpeed = 1;
        let newCircle = new Circle(radius, constantSpeed, "Media/Images/pez1.png");
        circles.push(newCircle);
    }
}

function updateStats() {
    stats.innerHTML = `Tiempo de pesca: ${timeElapsed}s - Peces atrapados: ${removedCircles}`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeElapsed++;
        updateStats();
    }, 1000);
}

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseY <= 190) {  // Solo liberar el pez cuando se hace clic en la zona superior
        for (let i = 0; i < circles.length; i++) {
            if (circles[i].attached) {
                explosionSound.cloneNode().play();
                removedCircles++;
                updateStats();
                circles.splice(i, 1);  // Eliminar el pez atrapado de la lista
                break;  // Salir del bucle después de liberar el pez
            }
        }
    }
});

function checkCeboCollision() {
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let dx = window_width / 2 - circle.posX;
        let dy = ceboPosY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.radius + 20 && !circle.attached) {
            // Solo atrapa el pez si no hay otro pez atrapado
            if (!circles.some(c => c.attached)) {
                circle.attached = true;
            }
        }
    }
}

function updateCircles() {
    requestAnimationFrame(updateCircles);  
    drawBackground();  

    circles.forEach((circle) => {
        circle.update();  
        circle.draw();  
    });

    ctx.drawImage(cebo, window_width / 2 - 20, ceboPosY - 20, 40, 40);  
    checkCeboCollision();
}

startTimer();
spawnCircles();
updateCircles();