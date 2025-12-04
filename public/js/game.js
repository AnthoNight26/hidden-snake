const playlist = [
    "/mus/both retro.mp3",
    "/mus/snakesong.mp3",
];

var myAudio = document.createElement("audio");
function lancerMusiqueAleatoire() {
    // Choisir un index au hasard (0, 1 ou 2...)
    const randomIndex = Math.floor(Math.random() * playlist.length);
    
    // Charger la musique correspondante
    myAudio.src = playlist[randomIndex];
    myAudio.play();
}
myAudio.loop = true; // <--- AJOUTE CETTE LIGNE (Active la répétition)
myAudio.volume = 0.5; // (Optionnel) Règle le volume à 50% pour ne pas casser les oreilles
const overlay = document.getElementById('snake-overlay');
const idpipo = document.getElementById("pipop1");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
// Récupération de la case à cocher
const teleportCheckbox = document.getElementById('checkTeleport');

// --- 1. CONFIGURATION ---
const config = {
    speed: 130,              
    boxSize: 20,            
    snakeColor: "#00FF00",  
    headColor: "#0dcb2aff",   
    foodColor: "#FF0055"
    // On a retiré wallTeleport d'ici car on le lit directement depuis la checkbox
};

let snake = [];
let food = {};
let score = 0;
let dir = "";
let gameLoop;

// --- GESTION DE L'OVERLAY ---

function ouvrirJeu() {
    idpipo.style.visibility = "visible";
    overlay.style.visibility = "visible";
    document.body.style.overflow = 'hidden'; 
    initGame();
}

function fermerJeu() {
    idpipo.style.visibility = "hidden";
    overlay.style.visibility = "hidden";
    document.body.style.overflow = 'auto'; 
    
    // Gestion Audio
    myAudio.pause();
    myAudio.currentTime = 0; // <--- AJOUTE CETTE LIGNE (Remet la musique au début)
    
    clearInterval(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") fermerJeu();
});

// --- LOGIQUE DU SNAKE ---

function initGame() {
    myAudio.pause();
    myAudio.currentTime = 0; 

    canvas.width = 400; 
    canvas.height = 400;

    snake = [{
        x: 9 * config.boxSize, 
        y: 10 * config.boxSize
    }];
    
    score = 0;
    dir = ""; 
    scoreSpan.innerText = score;
    
    placeFood(); // On place la première pomme correctement
    
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameTurn, config.speed);
}

document.addEventListener('keydown', direction);

function direction(event) {
    if (myAudio.paused) {
        lancerMusiqueAleatoire();
    }
    if(overlay.style.visibility === "visible") {
        if([37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
    } else {
        return; 
    }

    let key = event.keyCode;
    if( key == 37 && dir != "RIGHT") dir = "LEFT";
    else if(key == 38 && dir != "DOWN") dir = "UP";
    else if(key == 39 && dir != "LEFT") dir = "RIGHT";
    else if(key == 40 && dir != "UP") dir = "DOWN";
}

// --- NOUVELLE FONCTION POUR PLACER LA POMME ---
function placeFood() {
    let validPosition = false;
    
    while (!validPosition) {
        // 1. On génère une position au hasard
        food = {
            x: Math.floor(Math.random() * (canvas.width / config.boxSize)) * config.boxSize,
            y: Math.floor(Math.random() * (canvas.height / config.boxSize)) * config.boxSize
        };

        // 2. On vérifie si elle tombe sur le serpent
        validPosition = true; // On part du principe que c'est bon...
        
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                validPosition = false; // Ah non, c'est sur le serpent !
                break; // On arrête de chercher et on recommence la boucle while
            }
        }
    }
}

function gameTurn() {
    // 1. LOGIQUE
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(dir != "") {
        if(dir == "LEFT") snakeX -= config.boxSize;
        if(dir == "UP") snakeY -= config.boxSize;
        if(dir == "RIGHT") snakeX += config.boxSize;
        if(dir == "DOWN") snakeY += config.boxSize;

        // --- GESTION DES MURS ET TÉLÉPORTATION ---
        
        // On vérifie si on touche un bord
        const hitLeft = snakeX < 0;
        const hitRight = snakeX >= canvas.width;
        const hitTop = snakeY < 0;
        const hitBottom = snakeY >= canvas.height;

        if (hitLeft || hitRight || hitTop || hitBottom) {
            
            // Si la case est cochée : ON TÉLÉPORTE
            if (teleportCheckbox.checked) {
                if (hitRight) snakeX = 0;
                else if (hitLeft) snakeX = canvas.width - config.boxSize;
                else if (hitBottom) snakeY = 0;
                else if (hitTop) snakeY = canvas.height - config.boxSize;
            } 
            // Si la case n'est pas cochée : GAME OVER
            else {
                clearInterval(gameLoop);
                alert("GAME OVER ! Tu as pris le mur. Score : " + score);
                initGame();
                return;
            }
        }

        // Manger la pomme
        if(snakeX == food.x && snakeY == food.y) {
            score++;
            scoreSpan.innerText = score;
            placeFood();
        } else {
            snake.pop(); 
        }

        // Collision avec soi-même
        let newHead = { x: snakeX, y: snakeY };

        if(collision(newHead, snake)) {
            clearInterval(gameLoop);
            alert("GAME OVER ! Tu t'es mordu la queue. Score : " + score);
            initGame();
            return;
        }

        snake.unshift(newHead);
    }

    // 2. DESSIN
    ctx.fillStyle = "#111"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? config.headColor : config.snakeColor;
        ctx.fillRect(snake[i].x, snake[i].y, config.boxSize, config.boxSize);
        ctx.strokeStyle = "#000"; 
        ctx.strokeRect(snake[i].x, snake[i].y, config.boxSize, config.boxSize);
    }

    ctx.fillStyle = config.foodColor;
    ctx.fillRect(food.x, food.y, config.boxSize, config.boxSize);
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}