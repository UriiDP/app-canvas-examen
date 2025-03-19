const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = 800;
const window_width = 1000;
canvas.height = window_height;
canvas.width = window_width;

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;

    // Limitar la posición vertical del cebo dentro del canvas
    ceboPosY = Math.max(0, Math.min(window_height, mouseY));
});


// Establecer la imagen de fondo del canvas
const background = new Image();
background.src = "Media/Images/Fondo_mar.png";
background.onload = drawBackground; // Asegurar que la imagen se cargue antes de dibujarla

function drawBackground() {
    ctx.drawImage(background, 0, 0, window_width, window_height);
}

// Estilización de la página
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

let level = 1;
let totalCircles = 10;
let removedCircles = 0;
let circles = [];
const levelSize = 10;
let timeLeft = 10;
let timer;
let explosions = [];

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
retryButton.innerText = "Reintentar Nivel";
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
    level = 1;
    spawnCircles();
    retryButton.style.display = "none";
    messageDiv.style.display = "none";
});

const cebo = new Image();
cebo.src = "Media/Images/cebo.png";  // Ruta de la imagen del cebo
let ceboPosY = window_height / 2;  // Inicializa el cebo en el centro del canvas

class Circle {
    constructor(y, radius, speed, imageSrc) {
        this.posX = Math.random() > 0.5 ? -radius : window_width + radius;
        this.posY = Math.random() * (window_height / 2) + (window_height / 2); // Solo en la mitad inferior
        this.radius = radius;
        this.speed = speed;
        this.dx = this.posX < 0 ? speed : -speed;
        this.dy = 0.1;  // Un valor pequeño para el zigzag
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(context) {
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
    }

    update() {
        this.posX += this.dx;
        this.posY += this.dy; // Mover el pez hacia arriba o abajo con el valor constante de dy
    
        // Si el pez llega al borde superior o inferior, simplemente cambia el valor de dy en vez de rebotar.
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy; // Cambiar la dirección del zigzag si llega al borde
        }
    
        // Si el pez se ha ido completamente de la pantalla, lo reiniciamos
        if (this.posX + this.radius < 0 || this.posX - this.radius > window_width) {
            this.posX = Math.random() > 0.5 ? -this.radius : window_width + this.radius;
            this.posY = Math.random() * (window_height / 2) + (window_height / 2); // Reiniciar la posición
        }
    }
}    


let activeCircles = 0;

function spawnCircles() {
    // Solo generar un pez al principio
    if (circles.length === 0) {
        const radius = Math.random() * 20 + 30;  // Radio aleatorio del pez
        const constantSpeed = 1;  // Velocidad constante
        
        // Crear el primer pez
        let newCircle = new Circle(0, radius, constantSpeed, "Media/Images/pez1.png");
        
        // Agregarlo a la lista de peces
        circles.push(newCircle);
    }
}

function updateStats() {
    let percentage = ((removedCircles / totalCircles) * 100).toFixed(2);
    stats.innerHTML = `Tiempo: ${timeLeft}s - Peces atrapados: ${removedCircles}/${totalCircles} (${percentage}%) - Nivel: ${level}`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        updateStats();
        if (timeLeft <= 0) {
            clearInterval(timer);
            messageDiv.innerText = "Nivel fallado";
            messageDiv.style.display = "block";
            retryButton.style.display = "block";
        }
    }, 1000);
}

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    circles = circles.filter(circle => {
        let dx = mouseX - circle.posX;
        let dy = mouseY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.radius) {
            explosionSound.cloneNode().play();
            removedCircles++;
            updateStats();
            activeCircles--; // Reducir la cantidad de peces activos al hacer clic en uno
            return false;
        }
        return true;
    });
});

function checkCeboCollision() {
    circles.forEach((circle, index) => {
        let dx = window_width / 2 - circle.posX;
        let dy = ceboPosY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.radius + 20) {  // 20 es la mitad del tamaño del cebo
            explosionSound.cloneNode().play();
            removedCircles++;
            updateStats();
            circles.splice(index, 1);  // Eliminar el pez tocado
        }
    });
}

function updateCircles() {
    requestAnimationFrame(updateCircles);  // Llamada continua a la función
    drawBackground();  // Dibujar el fondo

    // Filtrar y eliminar los círculos que han salido de la pantalla
    circles = circles.filter(circle => {
        circle.update();  // Actualizar la posición de cada pez
        circle.draw(ctx);  // Dibujar el pez en el canvas

        // Si el pez se ha salido de la pantalla, lo eliminamos
        if (circle.posX + circle.radius < 0 || circle.posX - circle.radius > window_width) {
            return false;  // Eliminar el pez de la lista
        }
        return true;  // Mantener el pez si está dentro del canvas
    });

    spawnCircles();  // Llamar constantemente a la función para generar un pez

    // Dibujar el cebo
    ctx.drawImage(cebo, window_width / 2 - 20, ceboPosY - 20, 40, 40);  // Ajustar el tamaño y posición del cebo
    
    // Verificar si el cebo colisiona con algún pez
    checkCeboCollision();
}


spawnCircles();
updateCircles();
