const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// const cells = 5;
const width = window.innerWidth - 5;
const height = window.innerHeight - 5;
const cellsHor = 14;
const cellsVer = 10;

const unitLengthX = width / cellsHor;
const unitLengthY = height / cellsVer;

// const unitLength =width / cells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
  Bodies.rectangle(width / 2, 0, width, 5, {
    isStatic: true,
  }),
  Bodies.rectangle(width / 2, height, width, 5, {
    isStatic: true,
  }),
  Bodies.rectangle(0, height / 2, 5, height, {
    isStatic: true,
  }),
  Bodies.rectangle(width, height / 2, 5, height, {
    isStatic: true,
  }),
];

World.add(world, walls);

const grid = Array(cellsVer)
  .fill(null)
  .map(() => Array(cellsHor).fill(false));

const verticals = Array(cellsVer)
  .fill(null)
  .map(() => Array(cellsHor - 1).fill(false));

const horizontals = Array(cellsVer - 1)
  .fill(null)
  .map(() => Array(cellsHor).fill(false));

const shuffle = (arr) => {
  let count = arr.length;

  while (count > 0) {
    const index = Math.floor(Math.random() * count);

    count--;

    const temp = arr[count];
    arr[count] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const startRow = Math.floor(Math.random() * cellsVer);
const startColumn = Math.floor(Math.random() * cellsHor);

const stepThroughCell = (row, column) => {
  if (grid[row][column]) {
    return;
  }

  grid[row][column] = true;

  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);
  // console.log(neighbors);

  for (let neighbor of neighbors) {
    const [nextRow, nextCol, direction] = neighbor;

    if (
      nextRow < 0 ||
      nextRow >= cellsVer ||
      nextCol < 0 ||
      nextCol >= cellsHor
    ) {
      continue;
    }

    if (grid[nextRow][nextCol]) {
      continue;
    }

    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextCol);
  }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        render: {
          fillStyle: "red",
        },
        label: "wall",
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,

      {
        render: {
          fillStyle: "red",
        },
        label: "wall",
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.8,
  unitLengthY * 0.8,
  {
    render: {
      fillStyle: "green",
    },
    isStatic: true,
    label: "goal",
  }
);

World.add(world, goal);

const ballRad = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRad, {
  label: "ball",
});

World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  console.log(x, y);

  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }

  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
    // console.log("You pres D");
  }

  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
    // console.log("You pres S");
  }

  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
    // console.log("You pres A");
  }
});

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    console.log(collision);

    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
