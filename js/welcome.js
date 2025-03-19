document.addEventListener("DOMContentLoaded", () => {
    // Elementos de la pantalla de bienvenida
    const playBtn = document.getElementById("play-btn");
    const howToPlayBtn = document.getElementById("how-to-play-btn");

    // Función para redirigir a la pantalla del juego
    function startGame() {
        window.location.href = "game.html";  // Redirige a game.html
    }

    // Función para mostrar las instrucciones
    function showInstructions() {
        alert("Instrucciones del juego:\n1. Usa el mouse para mover el cebo de arriba hacia abajo y da click en el cielo una vez hayas pescado un pez.\n2. Atrapa los peces antes de que escapen.\n3. Evita los barriles o los pescados se escaparán.\n4. Evita los tiburones, si uno toca el cebo, perderás puntos");
    }

    // Evento para el botón "Jugar"
    playBtn.addEventListener("click", startGame);

    // Evento para el botón "Cómo jugar"
    howToPlayBtn.addEventListener("click", showInstructions);
});
