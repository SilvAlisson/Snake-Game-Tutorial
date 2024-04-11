// Selecionando o elemento canvas do DOM e obtendo seu contexto 2D, que vamos usar para desenhar nosso jogo na tela.
const canvas = document.querySelector("canvas");
const content = canvas.getContext("2d");

// Selecionando os elementos do DOM que serão usados para exibir a pontuação e controlar o jogo.
const score = document.querySelector(".scoreValue");
const finalScore = document.querySelector(".finalScore > span");
const menu = document.querySelector(".menu");
const restart = document.querySelector(".btn-play");

// Audio ativado quando a cobrar come a comida.
const audio = new Audio ('../Audio/audio.mp3');

// Aqui você está criando novos objetos de imagem e carregando arquivos de imagem neles. Estes serão usados para desenhar a cabeça da cobra.
let imgUp = new Image();
imgUp.src = 'Images/head-up.png';
let imgDown = new Image();
imgDown.src = 'Images/head-down.png';
let imgLeft = new Image();
imgLeft.src = 'Images/head-left.png';
let imgRight = new Image();
imgRight.src = 'Images/head-Right.png';

// Definindo o tamanho de cada "célula" do jogo. Isso será usado para desenhar a cobra e a comida.
const size = 25;

// Aqui você definimos a cobra como uma matriz de objetos, onde cada objeto representa uma parte da cobra e tem uma posição especifica de  x e y, note que o valor precisa ser multiplo de 25.
let snake = [
    { x: 300, y: 300 },
    { x: 325, y: 300 },
    { x: 350, y: 300 },
];

// A função 'increaseScore' aumenta a pontuação do jogo.
const increaseScore = () => {
    score.innerText = +score.innerText + 1
}

// A função 'randomNumber' gera um número aleatório.
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// A função 'randomPosition' gera uma posição aleatória no canvas.
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 25) * 25
}

// A função 'randomColor' gera uma cor RGB aleatória para a comida, definimos a menor cor como "50" para evitar que fossem geradas comidas totalmente pretas.
const randomColor = () => {
    const red = randomNumber(50, 255)
    const green = randomNumber(50, 255)
    const blue = randomNumber(50, 255)
    return `rgb(${red}, ${green}, ${blue})`
}

// Nessa parte estamos definindo que a comida irá aparecer em uma posição aleatória dentro do nosso Canvas.
const food = {
    x: randomPosition(),
    y:randomPosition(),
    color: randomColor()
}

// Aqui vamos definindo algumas variáveis que serão usadas para controlar a direção da cobra e o loop do jogo.
let direction, nextDirection, loopId

// A função 'drawFood' desenha a comida no canvas.
const drawFood = () => {
    const { x, y, color} = food

    content.shadowColor = color
    content.shadowBlur = 8
    content.fillStyle = color
    content.fillRect(x, y, size, size)
    content.shadowBlur = 0
}

// A função 'drawSnake' desenha a cobra no canvas.
const drawSnake = () => {
    snake.forEach((position, index) => {
        if (index === snake.length - 1) {
            // Aqui usamos imagens para desenhar a cabeça da cobra, pois será mais fácil para alterar as direções para onde a cobra deve olhar
            content.drawImage(imgRight, position.x, position.y, size, size);

            switch(direction) {
                case 'up':
                    content.drawImage(imgUp, position.x, position.y, size, size);
                    break;
                case 'down':
                    content.drawImage(imgDown, position.x, position.y, size, size);
                    break;
                case 'left':
                    content.drawImage(imgLeft, position.x, position.y, size, size);
                    break;
                case 'right':
                    content.drawImage(imgRight, position.x, position.y, size, size);
                    break;
            }
        } else {
            // Desenhando o corpo da cobra
            content.fillStyle = "green";
            content.fillRect(position.x, position.y, size, size);
        }
    });
};


// A função 'move' atualiza a posição da cobra com base na direção atual.
const move = () => {
    if(!nextDirection) return // Se não houver uma próxima direção definida, a função retorna e não faz nada.
    const head = snake[snake.length - 1] // A cabeça da cobra é a última posição na matriz da cobra.

    // Dependendo da próxima direção, uma nova posição é adicionada ao final da matriz da cobra.
    if (nextDirection == "right" ) {
        snake.push({ x: head.x + size , y: head.y })
    }
    
    if (nextDirection == "left" ) {
        snake.push({ x: head.x - size , y: head.y })
    }
    
    if (nextDirection == "down" ) {
        snake.push({ x: head.x , y: head.y + size })
    }
    
    if (nextDirection == "up" ) {
        snake.push({ x: head.x , y: head.y - size })
    }

    direction = nextDirection; // A direção atual é atualizada para a próxima direção, utilizamos "nextDirection" para não ocorrer bugs onde quando você pressiona por exemplo, seta para cima e seta para esquerda muito rápido, a cobra simplesmente passava por dentro de sí mesma e virava na direção contrária o que iria fazer o jogo acabar por auto solisão.
    snake.shift() // A primeira posição na matriz da cobra é removida, o que faz a cobra se mover.
}

// A função 'AteFood' verifica se a cobra comeu a comida. Se sim, ela aumenta a pontuação, toca o som por ter comido e gera uma nova comida em uma posição aleatória.
const AteFood = () => {
    const head = snake[snake.length - 1] // A cabeça da cobra é a última posição na matriz da cobra.

    // Se a posição da cabeça da cobra é a mesma que a posição da comida uma nova posição é adicionada ao final da matriz da cobra.
    if(head.x == food.x && head.y == food.y) { 
        snake.push(head)
        increaseScore()
        audio.play() // Som de quando a cobra come a comida.

        // Gerando uma nova posição para a comida.
        let x = randomPosition()
        let y = randomPosition()

        // Essa parte do código serve para que a comida não seja gerada em uma parte já ocupada pelo corpo da cobra.
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        // A posição e a cor da comida são atualizadas aleatoriamente.
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}



// A função 'colision' verifica se a cobra colidiu com as bordas do canvas ou com ela mesma. Se sim, ela chama a função 'gameOver'.
const colision = () => {
    const head = snake[snake.length -1] 
    const limit = canvas.width - size 
    const body = snake.length - 2 

    // Verifica se a cobra colidiu com as bordas do canvas.
    const canvasColision = head.x < 0 || head.x > limit || head.y < 0 || head.y > limit

    // Verifica se a cobra colidiu consigo mesma.
    const selfColision = snake.find((position, bodyColision) => {
        return bodyColision < body && position.x == head.x && position.y == head.y
    })

    // Se houve alguma colisão, o jogo termina.
    if (canvasColision || selfColision) {
        gameOver()
    }
}

// A função 'gameOver' é chamada quando o jogo termina. Ela redefine as direções da cobra e exibe o menu de jogar novamente.
const gameOver = () => {
    direction = undefined
    nextDirection = undefined

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
}

// A função 'game' é o loop principal do jogo. Ela limpa o canvas, move a cobra, desenha a cobra e a comida, verifica se a cobra comeu a comida e se houve colisão.
const game = () => {
    clearInterval(loopId)
    content. clearRect(0, 0, 650, 650)

    move()
    drawSnake()
    drawFood()
    AteFood()
    colision()

    loopId = setTimeout(() => {
        game()
    }, 200);
}

// Chamando a função 'game' para iniciar o jogo.
game()

// Controlando a direção da cobra.
document.addEventListener("keydown", ({key}) => {

    if (key == "ArrowUp"  && direction !== "down") {
        nextDirection = "up"
    }

    else if(key == "ArrowRight"  && direction !== "left") {
        nextDirection = "right"
    }
    
    else if(key == "ArrowDown"  && direction !== "up") {
        nextDirection = "down"
    }

    else if(key == "ArrowLeft" && direction !== "right") {
        nextDirection = "left"
    }
})

// Reiniciando o jogo.
restart.addEventListener("click", () => {
    score.innerText = "00"
    menu.style.display = "none"
    snake = [
        { x: 300, y: 300 },
        { x: 325, y: 300 },
        { x: 350, y: 300 },
    ];
})
