const playlist = [
    "/mus/both retro.mp3",
    "/mus/snakesong.mp3",
];

let tx = 400;
let ty = 400;

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
// Récupération de la case pour le bug de placement (ajouté pour éviter l'erreur dans la fonction placeFood)
const checkBugPlacement = document.getElementById('checkBugPlacement'); 


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
let timerKey = 5;
// --- GESTION DE L'OVERLAY ---

function ouvrirJeu(x,y) {
    tx = x || 400;
    ty = y || 400;
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

    canvas.width = tx; 
    canvas.height = ty;

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
    if(overlay.style.visibility === "visible") {
        if([37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
    } else {
        return; 
    }

    if (timerKey>=1){
        timerKey=0;
        let key = event.keyCode;
        if( key == 37 && dir != "RIGHT") dir = "LEFT";
        else if(key == 38 && dir != "DOWN") dir = "UP";
        else if(key == 39 && dir != "LEFT") dir = "RIGHT";
        else if(key == 40 && dir != "UP") dir = "DOWN";
    }
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
        if(!checkBugPlacement.checked){ // L'élément checkBugPlacement n'existait pas dans l'original, mais est utilisé plus bas, je l'ai ajouté dans les définitions pour éviter une erreur.
            validPosition = true; // On part du principe que c'est bon...
        } else {
            validPosition = false;
        }
        
        for (let part of snake) {
            if (part.x == food.x && part.y == food.y) {
                if(!checkBugPlacement.checked){
                    validPosition = false; // Ah non, c'est sur le serpent !
                } else {
                    validPosition = true;
                }
                break; // On arrête de chercher et on recommence la boucle while
            }
        }
    }
}

// ===============================================
// === NOUVELLE FONCTION DE DESSIN DES YEUX (Yeux) ===
// ===============================================

function drawEyes(snakeHead, direction) {
    const box = config.boxSize;
    const eyeSize = box * 0.15; // Taille des yeux (15% de la taille du bloc)
    const eyeColor = "#FFFFFF";  // Couleur des yeux (Blanc)
    
    ctx.fillStyle = eyeColor;

    // Calcul de la position des yeux en fonction de la direction de la tête
    let eye1X, eye1Y, eye2X, eye2Y;

    if (direction === "RIGHT" || direction === "LEFT") {
        // Décalage vertical pour les yeux (haut et bas du bloc)
        const offset = box * 0.25; 
        
        // Position X légèrement en retrait de l'avant
        const xOffset = direction === "RIGHT" ? box * 0.8 : box * 0.2; 
        
        eye1X = snakeHead.x + xOffset;
        eye2X = snakeHead.x + xOffset;
        eye1Y = snakeHead.y + offset;
        eye2Y = snakeHead.y + box - offset;
        
    } else if (direction === "UP" || direction === "DOWN") {
        // Décalage horizontal pour les yeux (gauche et droite du bloc)
        const offset = box * 0.25; 
        
        // Position Y légèrement en retrait de l'avant
        const yOffset = direction === "DOWN" ? box * 0.8 : box * 0.2; 
        
        eye1X = snakeHead.x + offset;
        eye2X = snakeHead.x + box - offset;
        eye1Y = snakeHead.y + yOffset;
        eye2Y = snakeHead.y + yOffset;
    } else {
        // Si aucune direction (début du jeu), on dessine des yeux standards, par exemple, vers la droite
        eye1X = snakeHead.x + box * 0.8;
        eye2X = snakeHead.x + box * 0.8;
        eye1Y = snakeHead.y + box * 0.25;
        eye2Y = snakeHead.y + box * 0.75;
    }
    
    // Dessin des deux yeux
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, 2 * Math.PI);
    ctx.fill();
}


function gameTurn() {
    
    if (myAudio.paused) {
        lancerMusiqueAleatoire();
    }
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

        timerKey ++;

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
    
    // =============================================
    // === DESSIN DES YEUX (Nouvelle étape) ===
    // =============================================
    if (snake.length > 0) {
        drawEyes(snake[0], dir); 
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