const PLAYER_WIDTH = 25;
const FIGURE_WIDTH = 15;
const ENEMY_WIDTH = 50;
const HEALING_WIDTH = FIGURE_WIDTH;
const SLOW_BOOST_WIDTH = FIGURE_WIDTH;
const ATTACK_SPEED_BOOST_WIDTH = FIGURE_WIDTH;
const BOOSTS_MAP = {
  healing: HEALING_WIDTH,
  slowBoost: SLOW_BOOST_WIDTH,
  attackSpeedBoost: ATTACK_SPEED_BOOST_WIDTH,
};
const ATTACK_PROJECTILE_W = FIGURE_WIDTH;
const GRID_WIDTH = 750;
const PLAYER_MOVESPEED = 6;
const ATTACK_PROJECTILE_MS = 10;
const MOVING_OBSTACLE_MS = 6;
const SHOOTING_CD = 15;

// TODO: from/to
const random = (n, withZero = false) => n === 0 ? 0 : Math.floor(Math.random()*(n + 1)) + (withZero ? 0 : 1);
const px = (num) => num + "px";
const fromPx = (val) => Number((val || "").replaceAll("px", ""));
const checkIfInArea = ({ left, top }, area, areaWidth) => {
  if (
    top >= area.offsetTop &&
    top <= area.offsetTop + areaWidth &&
    left >= area.offsetLeft &&
    left <= area.offsetLeft + areaWidth
  ) {
    return true;
  }
  return false;
};
const checkIfInObstacleArea = (coords, obstacle) => checkIfInArea(coords, obstacle, FIGURE_WIDTH);
const checkIfInHealingArea = (coords, healing) => checkIfInArea(coords, healing, HEALING_WIDTH);
const checkIfInSlowBoostArea = (coords, slowBoost) => checkIfInArea(coords, slowBoost, SLOW_BOOST_WIDTH);
const checkIfInAttackSpeedBoostArea = (coords, attackSpeedBoost) => checkIfInArea(coords, attackSpeedBoost, ATTACK_SPEED_BOOST_WIDTH);
const checkIfInPlayerArea = (coords, player) => checkIfInArea(coords, player, PLAYER_WIDTH);
const checkIfInAttackProjectileArea = (coords, attackProjectile) => checkIfInArea(coords, attackProjectile, ATTACK_PROJECTILE_W);
const checkIfInEnemyArea = (coords, enemy) => checkIfInArea(coords, enemy, ENEMY_WIDTH);
const randomProperty = (obj) => {
  var keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
};
const START_POSITION_MAP = (fixedRange = null, range = GRID_WIDTH - FIGURE_WIDTH) => ({
  top: {
    key: "top",
    left: px(fixedRange || random(range)),
    top: "0px",
  },
  bottom: {
    key: "bottom",
    left: px(fixedRange || random(range)),
    top: px(GRID_WIDTH),
  },
  left: {
    key: "left",
    left: "0px",
    top: px(fixedRange || random(range)),
  },
  right: {
    key: "right",
    left: px(GRID_WIDTH),
    top: px(fixedRange || random(range)),
  },
});

const grid = document.querySelector(".grid");
grid.style.width = px(GRID_WIDTH);
grid.style.height = px(GRID_WIDTH);
const player = document.querySelector(".grid .player");
player.style.width = px(PLAYER_WIDTH);
player.style.height = px(PLAYER_WIDTH);
player.style.top = px(GRID_WIDTH / 2 - PLAYER_WIDTH / 2);
player.style.left = px(GRID_WIDTH / 2 - PLAYER_WIDTH / 2);
const gameTime = document.querySelector("#gameTime");
const difficultyContainer = document.querySelector("#difficulty");
const healthContainer = document.querySelector("#health");
const slowBoostContainer = document.querySelector("#slowBoost");
const attackSpeedBoostContainer = document.querySelector("#attackSpeedBoost");

const updateText = (node, text) => node.innerText = String(text);

const updateGameTime = (time) => updateText(gameTime, time);
const updateDifficultyContainer = (difficulty) => updateText(difficultyContainer, difficulty);
const updateHealthContainer = (health) => updateText(healthContainer, health);
const updateSlowBoostContainer = (value) => updateText(slowBoostContainer, value ? '✔️' : '❌');
const updateAttackSpeedBoostContainer = (value) => updateText(attackSpeedBoostContainer, value ? '✔️' : '❌');

const getCorners = (node, width) => [
  { left: node.offsetLeft, top: node.offsetTop },
  { left: node.offsetLeft + width, top: node.offsetTop },
  { left: node.offsetLeft, top: node.offsetTop + width },
  { left: node.offsetLeft + width, top: node.offsetTop + width },
];

const checkIsInterfering = (
  rect1,
  rect2,
  rect1Width,
  rect2Width,
  checkIfInRect1Area,
  checkIfInRect2Area,
) => {
  const [r1TopLeftCorner, r1TopRigthCorner, r1BottomLeftCorner, r1BottomCorner] = getCorners(rect1, rect1Width);
  const [r2TopLeftCorner, r2TopRigthCorner, r2BottomLeftCorner, r2BottomCorner] = getCorners(rect2, rect2Width);
  if (
    checkIfInRect2Area(r1TopLeftCorner, rect2) ||
    checkIfInRect2Area(r1TopRigthCorner, rect2) ||
    checkIfInRect2Area(r1BottomLeftCorner, rect2) ||
    checkIfInRect2Area(r1BottomCorner, rect2) ||
    checkIfInRect1Area(r2TopLeftCorner, rect1) ||
    checkIfInRect1Area(r2TopRigthCorner, rect1) ||
    checkIfInRect1Area(r2BottomLeftCorner, rect1) ||
    checkIfInRect1Area(r2BottomCorner, rect1)
  ) {
    return true;
  }
  return false;
};

const checkGettingInObstacle = () => {
  const allObstacles = document.querySelectorAll(".obstacle:not(.enemy)");
  let isGettingInObstacle = false;
  let obstacleNode = null;
  for (const obstacle of allObstacles) {
    if (checkIsInterfering(
      obstacle,
      player,
      FIGURE_WIDTH,
      PLAYER_WIDTH,
      checkIfInObstacleArea,
      checkIfInPlayerArea,
    )) {
      isGettingInObstacle = true;
      obstacleNode = obstacle;
      break;
    }
  }
  return {isGettingInObstacle, obstacleNode};
};

const checkGettingHealing = () => {
  const allHealings = document.querySelectorAll(".healing");
  let isGettingHealing = false;
  let healingNode = null;
  for (const healing of allHealings) {
    if (checkIsInterfering(
      healing,
      player,
      HEALING_WIDTH,
      PLAYER_WIDTH,
      checkIfInHealingArea,
      checkIfInPlayerArea,
    )) {
      isGettingHealing = true;
      healingNode = healing;
      break;
    }
  }
  return {isGettingHealing, healingNode};
}

const checkGettingSlowBoost = () => {
  const allSlowBoosts = document.querySelectorAll(".slowBoost");
  let isGettingSlowBoost = false;
  let slowBoostNode = null;
  for (const slowBoost of allSlowBoosts) {
    if (checkIsInterfering(
      slowBoost,
      player,
      SLOW_BOOST_WIDTH,
      PLAYER_WIDTH,
      checkIfInSlowBoostArea,
      checkIfInPlayerArea,
    )) {
      isGettingSlowBoost = true;
      slowBoostNode = slowBoost;
      break;
    }
  }
  return {isGettingSlowBoost, slowBoostNode};
}

const checkGettingAttackSpeedBoost = () => {
  const allAttackSpeedBoosts = document.querySelectorAll(".attackSpeedBoost");
  let isGettingAttackSpeed = false;
  let attackSpeedBoostNode = null;
  for (const attackSpeedBoost of allAttackSpeedBoosts) {
    if (checkIsInterfering(
      attackSpeedBoost,
      player,
      ATTACK_SPEED_BOOST_WIDTH,
      PLAYER_WIDTH,
      checkIfInAttackSpeedBoostArea,
      checkIfInPlayerArea,
    )) {
      isGettingAttackSpeed = true;
      attackSpeedBoostNode = attackSpeedBoost;
      break;
    }
  }
  return {isGettingAttackSpeed, attackSpeedBoostNode};
}

const checkHittingEnemy = () => {
  const allAttackProjectiles = document.querySelectorAll(".attackProjectile");
  const enemy = document.querySelector(".enemy");
  if (!enemy) return { isHittingEnemy: false };
  let isHittingEnemy = false;
  let allAttackProjectileNode = null;
  for (const allAttackProjectile of allAttackProjectiles) {
    if (checkIsInterfering(
      allAttackProjectile,
      enemy,
      ATTACK_PROJECTILE_W,
      ENEMY_WIDTH,
      checkIfInAttackProjectileArea,
      checkIfInEnemyArea,
    )) {
      isHittingEnemy = true;
      allAttackProjectileNode = allAttackProjectile;
      break;
    }
  }
  return {isHittingEnemy, allAttackProjectileNode};
};

const checkGameOver = (health) => {
  return health === 0 ? true : false;
};

let gameTimer = null;

const game = {
  hasStarted: false,
  startTime: null,
  hasPaused: false,
  isGameOver: false,
  startTime: null,
  endTime: null,
  time: 0,
  currentDifficulty: 10,
  health: 0,
  isSlowBoost: false,
  isAttackSpeedBoost: false,
  start: () => {
    console.log("start");
    game.health = 10;
    game.startTime = new Date();
    updateHealthContainer(game.health);
    game.hasStarted = true;
    const newEnemy = enemy.create();
    gameTimer = setInterval(()=>{
      const millisecondsPassed = new Date() - game.startTime;
      const s = Math.floor((millisecondsPassed / 1000) % 60);
      const m = Math.floor(millisecondsPassed / 1000 / 60);
      updateGameTime(`${m}m${s}s`);
      const enemyCurrentHealth = Number(newEnemy.getAttribute("data-health"));
      const isGameOver = checkGameOver(game.health);
      if (isGameOver) {
        game.stop();
        game.isGameOver = true;
      }
      const {isGettingHealing, healingNode} = checkGettingHealing();
      if (isGettingHealing) {
        healingNode.remove();
        game.health += 1;
        updateHealthContainer(game.health);
      }
      const {isGettingInObstacle, obstacleNode} = checkGettingInObstacle();
      if (isGettingInObstacle) {
        obstacleNode.remove();
        game.health -= 1;
        updateHealthContainer(game.health);
      }
      const {isGettingSlowBoost, slowBoostNode} = checkGettingSlowBoost();
      if (isGettingSlowBoost) {
        slowBoostNode.remove();
        game.isSlowBoost = true;
        updateSlowBoostContainer(game.isSlowBoost);
        setTimeout(() => {
          game.isSlowBoost = false;
          updateSlowBoostContainer(game.isSlowBoost);
        }, 5000);
      }
      const {isGettingAttackSpeed, attackSpeedBoostNode} = checkGettingAttackSpeedBoost();
      if (isGettingAttackSpeed) {
        attackSpeedBoostNode.remove();
        game.isAttackSpeedBoost = true;
        updateAttackSpeedBoostContainer(game.isAttackSpeedBoost);
        setTimeout(() => {
          game.isAttackSpeedBoost = false;
          updateAttackSpeedBoostContainer(game.isAttackSpeedBoost);
        }, 5000);
      }
      const {isHittingEnemy, allAttackProjectileNode} = checkHittingEnemy();
      if (isHittingEnemy) {
        allAttackProjectileNode.remove();
        newEnemy.setAttribute("data-health", enemyCurrentHealth - 1);
        newEnemy.innerText = enemyCurrentHealth - 1;
        if (enemyCurrentHealth - 1 <= 0) {
          newEnemy.remove();
          newEnemy.setAttribute("data-destroy", "true");
        }
      }
      if (enemyCurrentHealth > 0 && game.time % SHOOTING_CD === 0) {
        playerObject.shoot();
      }
      if (game.time % (Math.abs(80-game.currentDifficulty) + 10) === 0) {
        movingObstacle.create();
      }
      if (game.time % 500 === 0) {
        healing.create();
        obstacle.create();
        obstacle.create();
      }
      if (game.time % 1000 === 0) {
        slowBoost.create();
        spreyPattern.create();
        if (enemyCurrentHealth > 0) attackSpeedBoost.create();
        game.currentDifficulty = game.currentDifficulty+1;
        updateDifficultyContainer(game.currentDifficulty);
      }
      game.time += 1;
    }, 10);
  },
  pause: () => {
    console.log("pause");
    game.hasPaused = true;
    clearInterval(gameTimer);
  },
  stop: () => {
    console.log("stop");
    game.hasStarted = false;
    clearInterval(gameTimer);
  }
}

const figure = {
  init: () => {
    const newFigure = document.createElement("div");
    newFigure.className = "figure";
    newFigure.style.width = px(FIGURE_WIDTH);
    newFigure.style.height = px(FIGURE_WIDTH);
    newFigure.addEventListener("click", ()=>{
      newFigure.remove();
    })
    return newFigure;
  }
}

const obstacle = {
  create: () => {
    const newObstacle = figure.init();
    newObstacle.className = "figure obstacle";
    grid.appendChild(newObstacle);
    setTimeout(() => {
      newObstacle.remove();
    }, 10000);
    newObstacle.style.left = px(random(GRID_WIDTH - FIGURE_WIDTH));
    newObstacle.style.top = px(random(GRID_WIDTH - FIGURE_WIDTH));
  }
}

const movingObstacle = {
  create: (config = {}) => {
    const delay = config.delay ?? 1000;
    const deviationPower = config.deviation ?? 4;
    const newObstacle = figure.init();
    const destroyObstacle = () => newObstacle.remove();
    newObstacle.className = "figure obstacle obstacleMoving";
    grid.appendChild(newObstacle);
    const startPosition = (() => {
      if (config.startPosition) return config.startPosition;
      return config.startPositionKey ? 
        START_POSITION_MAP(config.fixedRange)[config.startPositionKey] : 
        randomProperty(START_POSITION_MAP());
    })();
    newObstacle.style.left = startPosition.left;
    newObstacle.style.top = startPosition.top;
    const speed = config.fixedSpeed ?? random(MOVING_OBSTACLE_MS) + 2;
    const deviation = (() => {
      if (typeof config.fixedDeviation !== "undefined") return config.fixedDeviation;
      return Math.random() > 0.5 ? random(deviationPower, true) : -random(deviationPower, true);
    })();
    setTimeout(()=>{
      const movingTimer = setInterval(()=>{
        const top = fromPx(newObstacle.style.top || "");
        const left = fromPx(newObstacle.style.left || "");
        const isBeyondBorder = (startPositionKey) => {
          switch (startPositionKey) {
            case "top":
              return top > GRID_WIDTH || left > GRID_WIDTH || left <= 0;
            case "bottom":
              return top <= 0 || left > GRID_WIDTH || left <= 0;
            case "left":
              return left > GRID_WIDTH || top > GRID_WIDTH || top <= 0;
            case "right":
              return left <= 0 || top > GRID_WIDTH || top <= 0;
          }
        }
        if (isBeyondBorder(startPosition.key)) {clearInterval(movingTimer); destroyObstacle()};
        switch (startPosition.key) {
          case "top":
            newObstacle.style.top = px(top + speed / (game.isSlowBoost ? 2 : 1));
            newObstacle.style.left = px(left + deviation / (game.isSlowBoost ? 2 : 1));
            break;
          case "bottom":
            newObstacle.style.top = px(top - speed / (game.isSlowBoost ? 2 : 1));
            newObstacle.style.left = px(left - deviation / (game.isSlowBoost ? 2 : 1));
            break;
          case "left":
            newObstacle.style.left = px(left + speed / (game.isSlowBoost ? 2 : 1));
            newObstacle.style.top = px(top + deviation / (game.isSlowBoost ? 2 : 1));
            break;
          case "right":
            newObstacle.style.left = px(left - speed / (game.isSlowBoost ? 2 : 1));
            newObstacle.style.top = px(top - deviation / (game.isSlowBoost ? 2 : 1));
            break;
        }
      }, 20);
    }, delay);
  }
}

const movingToDestinationObstacle = {
  create: (config = {}) => {
    const destinationCoordinates = config.destinationCoordinates || [
      {top: 1000, left: 1000},
    ];
    const delay = config.delay ?? 1000;
    const newObstacle = figure.init();
    const destroyObstacle = () => newObstacle.remove();
    newObstacle.className = "figure obstacle obstacleMoving";
    grid.appendChild(newObstacle);
    const startPosition = (() => {
      if (config.startPosition) return config.startPosition;
      return config.startPositionKey ? 
        START_POSITION_MAP(config.fixedRange, config.fixedRange)[config.startPositionKey] : 
        randomProperty(START_POSITION_MAP());
    })();
    newObstacle.style.left = startPosition.left;
    newObstacle.style.top = startPosition.top;
    const speed = config.fixedSpeed ?? random(MOVING_OBSTACLE_MS) + 2;
    setTimeout(async () => {
      for (let i = 0; i < destinationCoordinates.length; i++) {
        await new Promise((resolve) => {
          const movingTimer = setInterval(()=>{
            const top = fromPx(newObstacle.style.top || "");
            const left = fromPx(newObstacle.style.left || "");
            const deltaTopAbs = Math.abs(top - destinationCoordinates[i].top);
            const deltaTop = top - destinationCoordinates[i].top;
            const deltaLeftAbs = Math.abs(left - destinationCoordinates[i].left);
            const deltaLeft = left - destinationCoordinates[i].left;
            const deltaDiff = deltaTopAbs - deltaLeftAbs;
            if (Math.abs(deltaLeftAbs) < 8 && Math.abs(deltaTopAbs) < 8) {
              clearInterval(movingTimer); 
              resolve();
              return;
            }
            // left is bigger - top is deviation
            if (deltaDiff <= 0) {
              const deviation = speed * (deltaTopAbs / deltaLeftAbs);
              newObstacle.style.left = px(left + (deltaLeft > 0 ? -speed : speed) / (game.isSlowBoost ? 2 : 1));
              newObstacle.style.top = px(top + (deltaTop > 0 ? -deviation : deviation) / (game.isSlowBoost ? 2 : 1));
            }
            // top is bigger - left is deviation
            if (deltaDiff >= 0) {
              const deviation = speed * (deltaLeftAbs / deltaTopAbs);
              newObstacle.style.top = px(top + (deltaTop > 0 ? -speed : speed) / (game.isSlowBoost ? 2 : 1));
              newObstacle.style.left = px(left + (deltaLeft > 0 ? -deviation : deviation) / (game.isSlowBoost ? 2 : 1));
            }
            const isBeyondBorder = () => {
              return top > GRID_WIDTH || top < 0 || left > GRID_WIDTH || left < 0;
            }
            if (isBeyondBorder()) {clearInterval(movingTimer); destroyObstacle()};
          }, 20);
        })
      }
      destroyObstacle();
    }, delay);
  }
}

const spreyPattern = {
  create: (config = {}) => {
    const startPositionKey = randomProperty(START_POSITION_MAP()).key;
    const fixedRange = random(500);
    let spawnsLeft = 25;
    const spawnTimer = setInterval(() => {
      if (spawnsLeft === 0) {
        console.log("stop spawn");
        clearInterval(spawnTimer);
      } else {
        spawnsLeft-=1;
        movingObstacle.create({
          delay: config.delay,
          deviation: config.deviation ?? 1,
          startPosition: config.startPosition,
          startPositionKey,
          fixedRange,
        })
      }
    }, 10);
  }
}

const radialPattern = {
  create: (config = {left: null, top:  null}) => {
    const speed = 10;
    const createConfiguredMovingObstacle = (key, deviation) => movingObstacle.create({
      fixedDeviation: deviation,
      fixedSpeed: speed,
      delay: 0,
      startPosition: {
        key: key,
        left: config.left || px(GRID_WIDTH / 2),
        top: config.top || px(GRID_WIDTH / 2),
      }
    });
    const obstaclesConfig = [
      {key: "top", deviation: 0},
      {key: "right", deviation: 0},
      {key: "bottom", deviation: 0},
      {key: "left", deviation: 0},
      {key: "top", deviation: speed},
      {key: "right", deviation: -speed},
      {key: "bottom", deviation: speed},
      {key: "left", deviation: -speed},
      {key: "top", deviation: -speed / 2},
      {key: "right", deviation: speed / 2},
      {key: "bottom", deviation: -speed / 2},
      {key: "left", deviation: speed / 2},
      {key: "top", deviation: speed / 2},
      {key: "right", deviation: -speed / 2},
      {key: "bottom", deviation: speed / 2},
      {key: "left", deviation: -speed / 2},
    ];
    for (const obstacleConfig of obstaclesConfig) {
      createConfiguredMovingObstacle(obstacleConfig.key, obstacleConfig.deviation);
    }
  }
}

const boost = {
  create: (config) => {
    const name = config.name;
    const newBoost = figure.init();
    newBoost.className = `figure ${name}`;
    grid.appendChild(newBoost);
    newBoost.style.left = px(random(GRID_WIDTH - BOOSTS_MAP[name]));
    newBoost.style.top = px(random(GRID_WIDTH - BOOSTS_MAP[name]));
    return newBoost;
  }
}

const healing = {
  create: () => {
    boost.create({name: "healing"});
  }
}

const slowBoost = {
  create: () => {
    const newSlowBoost = boost.create({name: "slowBoost"});
    setTimeout(() => {
      newSlowBoost.remove();
    }, 5000);
  }
}

const attackSpeedBoost = {
  create: () => {
    const newAttackSpeedBoost = boost.create({name: "attackSpeedBoost"});
    setTimeout(() => {
      newAttackSpeedBoost.remove();
    }, 5000);
  }
}

const attackProjectile = {
  create: (x, y) => {
    const newAttackProjectile = figure.init();
    newAttackProjectile.className = "figure attackProjectile";
    newAttackProjectile.style.left = px(x);
    newAttackProjectile.style.top = px(y);
    const speed = ATTACK_PROJECTILE_MS;
    const destroyObstacle = () => newAttackProjectile.remove();
    grid.appendChild(newAttackProjectile);
    const movingTimer = setInterval(()=>{
      const top = fromPx(newAttackProjectile.style.top || "");
      const left = fromPx(newAttackProjectile.style.left || "");
      if (top <= 0) {clearInterval(movingTimer); destroyObstacle()};
      newAttackProjectile.style.top = px(top - speed / (game.isSlowBoost ? 2 : 1));
      newAttackProjectile.style.left = px(left);
    }, 20);
  }
}

const playerObject = {
  move: (x, y) => {
    const left = fromPx(player.style.left || "");
    const top = fromPx(player.style.top || "");
    const newPosition = (current, coordinate) => {
      const resultOnMove = current + coordinate;
      if (resultOnMove + PLAYER_WIDTH > GRID_WIDTH) {
        return GRID_WIDTH - PLAYER_WIDTH;
      }
      return Math.max(resultOnMove, 0);
    }
    player.style.left = px(newPosition(left, x));
    player.style.top = px(newPosition(top, y));
  },
  shoot: () => {
    const left = fromPx(player.style.left || "");
    const top = fromPx(player.style.top || "");
    attackProjectile.create(left + PLAYER_WIDTH / 2 - ATTACK_PROJECTILE_W / 2, top - PLAYER_WIDTH / 2);
    if (game.isAttackSpeedBoost) {
      setTimeout(() => {
        attackProjectile.create(left + PLAYER_WIDTH / 2 - ATTACK_PROJECTILE_W / 2, top - PLAYER_WIDTH / 2);
      }, SHOOTING_CD * 4);
    }
  }
}

const enemy = {
  health: 1000,
  create: () => {
    const newEnemy = figure.init();
    newEnemy.className = "figure obstacle enemy";
    newEnemy.setAttribute("data-health", enemy.health);
    newEnemy.style.width = px(ENEMY_WIDTH);
    newEnemy.style.height = px(ENEMY_WIDTH);
    newEnemy.style.left = px(GRID_WIDTH / 2 - ENEMY_WIDTH / 2);
    newEnemy.style.top = px(GRID_WIDTH / 6);
    grid.appendChild(newEnemy);
    const speed = 2;
    let isMovingToRight = true;
    const movingTimer = setInterval(() => {
      const toDestroy = newEnemy.getAttribute("data-destroy") || !document.querySelector(".enemy");
      if (toDestroy) { clearInterval(movingTimer) };
      const top = fromPx(newEnemy.style.top || "");
      const left = fromPx(newEnemy.style.left || "");
      newEnemy.style.top = px(top);
      newEnemy.style.left = px(left + (isMovingToRight ? speed : -speed) / (game.isSlowBoost ? 2 : 1));
      if (left <= GRID_WIDTH / 4) { isMovingToRight = true };
      if (left >= GRID_WIDTH - GRID_WIDTH / 4) { isMovingToRight = false };
    }, 50);
    const shootingTimer = setInterval(async () => {
      const toDestroy = newEnemy.getAttribute("data-destroy") || !document.querySelector(".enemy");
      if (toDestroy) { clearInterval(shootingTimer); return; };
      const top = fromPx(newEnemy.style.top || "");
      const left = fromPx(newEnemy.style.left || "");
      let i = 0;
      const followObstacleShootingTimer = setInterval(() => {
        if (i >= 10) { clearInterval(followObstacleShootingTimer); }
        const top = fromPx(newEnemy.style.top || "");
        const left = fromPx(newEnemy.style.left || "");
        const playerTop = fromPx(player.style.top || "");
        const playerLeft = fromPx(player.style.left || "");
        const deltaTop = playerTop - top;
        const deltaLeft = playerLeft - left;
        i++;
        movingToDestinationObstacle.create({
          destinationCoordinates: [{top: playerTop + deltaTop * 2, left: playerLeft + deltaLeft * 2}],
          startPosition: {
            top: px(top + ENEMY_WIDTH / 4),
            left: px(left + ENEMY_WIDTH / 2),
          },
          delay: 0,
          fixedSpeed: 8
        });
      }, 100);
      radialPattern.create({
        top: px(top + ENEMY_WIDTH / 2),
        left: px(left + ENEMY_WIDTH / 2),
      })
    }, 10000);
    return newEnemy;
  }
}

function KeyboardController(keys, repeat) {
  // Lookup of key codes to timer ID, or null for no repeat
  var timers = {};

  // When key is pressed and we don't already think it's pressed, call the
  // key action callback and set a timer to generate another one after a delay
  //
  addEventListener("keydown", function(event) {
      const keyPressed = event.code.replace("Key", "");
      if (!(keyPressed in keys))
          return true;
      if (!(keyPressed in timers)) {
          timers[keyPressed]= null;
          keys[keyPressed]();
          if (repeat!==0)
              timers[keyPressed]= setInterval(keys[keyPressed], repeat);
      }
      return false;
  });

  // Cancel timeout and mark key as released on keyup
  //
  addEventListener("keyup", function(event) {
    const keyPressed = event.code.replace("Key", "");
      if (keyPressed in timers) {
          if (timers[keyPressed]!==null)
              clearInterval(timers[keyPressed]);
          delete timers[keyPressed];
      }
  });

  // When window is unfocused we may not get key events. To prevent this
  // causing a key to 'get stuck down', cancel all held keys
  //
  addEventListener("onblur", function() {
      for (const keyPressed in timers)
          if (timers[keyPressed]!==null)
              clearInterval(timers[keyPressed]);
      timers= {};
  });
};

KeyboardController({
  "A": () => { playerObject.move(-PLAYER_MOVESPEED, 0); },
  "W": () => { playerObject.move(0, -PLAYER_MOVESPEED); },
  "D": () => { playerObject.move(PLAYER_MOVESPEED, 0); },
  "S": () => { playerObject.move(0, PLAYER_MOVESPEED); },
  "Z": () => { obstacle.create(); },
  "X": () => { radialPattern.create(); },
  "C": () => { healing.create(); },
  "V": () => { slowBoost.create(); },
  "B": () => { movingObstacle.create(); },
  "N": () => { spreyPattern.create(); },
  "M": () => { movingToDestinationObstacle.create(); },
}, 20);

addEventListener("keydown", function(event) {
  const keyPressed = event.code.replace("Key", "");
  if (keyPressed === "G") {
    !game.isGameOver && !game.hasStarted && game.start();
  }
  if (keyPressed === "P") {
    game.pause();
  }
  if (keyPressed === "R") {
    game.isGameOver && game.start();
  }
});