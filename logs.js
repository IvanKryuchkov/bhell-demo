const logsContainer = document.querySelector(".logs");
const playerLogsContainer = document.querySelector("#playerLogs");
const obstacleLogsContainer = document.querySelector("#obstacleLogs");

const showLogs = () => {
  logsContainer.style.display = "block";
  setInterval(() => {
    const playerTop = player.style.top;
    const playerLeft = player.style.left;
    playerLogsContainer.innerText = `(top: ${playerTop}; left: ${playerLeft})`;
    const allObstacles = document.querySelectorAll("#grid .obstacle");
    obstacleLogsContainer.innerHTML = "";
    for (const obstacle of allObstacles) {
      const obstacleTop = Number((obstacle.style.top || "").replaceAll("px", ""));
      const obstacleLeft = Number((obstacle.style.left || "").replaceAll("px", ""));
      const node = document.createElement("div");
      node.innerHTML = `(top: ${obstacleTop}; left: ${obstacleLeft})`;
      obstacleLogsContainer.appendChild(node);
    }
  }, 10);

  const infoBox = document.getElementById("infoBox");

  grid.addEventListener("mouseover", () => {
    infoBox.style.display = "block";
  });

  grid.addEventListener("mouseout", () => {
    infoBox.style.display = "none";
  });

  grid.addEventListener("mousemove", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const gridX = event.offsetX;
    const gridY = event.offsetY;

    infoBox.innerHTML = `${gridX};${gridY}`;

    infoBox.style.left = mouseX + "px";
    infoBox.style.top = mouseY + "px";
  });
};
