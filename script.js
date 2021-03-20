window.addEventListener("load", function () {
  game.start();
});

const game = {
  htmlBoard: [],
  beginPosition: 0,
  endposition: 0,
  endSide: "",
  //currentgame: 0,
  atomPosition: "",
  gameId: 0,
  height: 0,
  width: 0,
  sidecliked: "none",
  currentstart: [0, 0],
  currentend: [0, 0],
  atome: [],
  zeahler: 0,
  win: false,
  //clickfields: [],
  //anfang: 0,
  allPosition: [],
  input: false,
  difficulty: ["easy", "normal", "difficult"],
  currentdif: "",
  Server: "https://www2.hs-esslingen.de/~melcher/atoms/",

  async start() {
    const button = document.querySelector("#play");
    const button2 = document.querySelector("#solve");
    const finish = document.getElementById("ergebnis");

    await this.buildBoardServer();
    button2.addEventListener("click", () => this.AtomeServer());

    button.addEventListener("click", () => {
      this.resetBoard();
      finish.innerHTML = "";
      finish.style.background = "white";
      const element = document.querySelector("#Spiel");
      element.innerHTML = "";
      this.buildBoardServer();
    });
  },

  init() {
    this.board = this.buildBoard();
    this.buildHtmlBoard();
    this.input = true;
  },

  resetBoard() {
    this.board = null;
    this.logikboard = null;
    this.clickboard = null;
    this.input = false;
  },

  //Server
  async buildBoardServer() {
    this.input = false;
    let i = Math.round(Math.random() * 2);
    this.currentdif = this.difficulty[i];
    const response = fetch(
      this.Server + "?request=newgame&difficulty=" + this.difficulty[i]
    );
    const json = await (await response).json();

    //Init
    this.gameId = json.gameid;
    this.height = json.height + 2;
    this.width = json.width + 2;

    //CSS
    document.getElementById("Spiel").style.width = this.width * 5;
    document.getElementById("Spiel").style.height = this.height * 5;

    return this.init();
  },

  //Shoot
  async ShootServer() {
    this.input = false;
    const response = fetch(
      this.Server +
        "?request=shoot&gameid=" +
        this.gameId +
        "&side=" +
        this.sidecliked +
        "&position=" +
        this.beginPosition
    );
    const json = await (await response).json();
    this.input = true;

    //Init
    this.endposition = json.position;
    this.endSide = json.side;

    this.setFile(this.beginPosition, this.sidecliked);

    //End
    if (
      this.endSide === this.sidecliked &&
      this.beginPosition === this.endposition
    ) {
      if (this.sidecliked === "top") {
        this.showPfeil(this.beginPosition + 1, 0, "doppeloben");
        return;
      } else if (this.sidecliked === "bottom") {
        this.showPfeil(this.beginPosition + 1, this.height - 1, "doppeloben");
        return;
      } else if (this.sidecliked === "right") {
        this.showPfeil(this.width - 1, this.beginPosition + 1, "doppelrechts");
        return;
      } else if (this.sidecliked === "left") {
        this.showPfeil(0, this.beginPosition + 1, "doppelrechts");

        return;
      }
    }

    if (this.endSide === "left") {
      this.showPfeil(0, this.endposition + 1, "pfeillinks");
    } else if (this.endSide === "right") {
      this.showPfeil(this.width - 1, this.endposition + 1, "pfeilrechts");
    } else if (this.endSide === "top") {
      this.showPfeil(this.endposition + 1, 0, "pfeiloben");
    } else if (this.endSide === "bottom") {
      this.showPfeil(this.endposition + 1, this.height - 1, "pfeilunten");
    }
  },

  //AomeServer
  async AtomeServer() {
    this.input = false;
    const response = fetch(
      this.Server +
        "?request=solve&gameid=" +
        this.gameId +
        "&atoms=[[" +
        this.atome.join("],[") +
        "]]"
    );
    const json = await (await response).json();
    this.input = true;
    console.dir(json);

    this.win = json.correct;
    this.atomPosition = JSON.parse(json.solution);
    this.allPosition = JSON.parse(json.atoms);
    console.log(this.atomPosition);
    this.check();
  },

  atomeclick(event) {
    if (this.input === true) {
      let clicked = event.target;
      side = clicked.getAttribute("data-Border");
      x = parseInt(clicked.getAttribute("data-x"));
      y = parseInt(clicked.getAttribute("data-y"));

      if (!(x > 1 && x < this.width - 2 && y > 1 && y < this.height - 2))
        return;

      if (this.board[x][y].classList.contains("atome")) {
        for (let i = 0; i < this.atome.length; i++) {
          if (this.atome[i][0] === x - 1 && this.atome[i][1] === y - 1) {
            this.atome.splice(i, 1);
            break;
          }
        }

        this.board[x][y].classList.remove("atome");
      } else {
        let currentClick = [x - 1, y - 1];
        this.atome.push(currentClick);
        this.board[x][y].classList.add("atome");
      }
    } else {
      return;
    }
  },

  check() {
    if (this.win === false) {
      console.log("verloren");
      document.getElementById("ergebnis").style.background = "red";
      document.getElementById("ergebnis").innerText = "YOU LOSE";
      document.getElementById("ergebnis").style.textAlign = "center";
      document.getElementById("ergebnis").style.lineHeight = "10em";
      document.getElementById("ergebnis").style.fontWeight = "bold";

      for (let x = 0; x < this.atomPosition.length; x++) {
        this.board[this.atomPosition[x][0] + 1][
          this.atomPosition[x][1] + 1
        ].style.background = "red";
      }
    } else {
      document.getElementById("ergebnis").style.background = "green";
      document.getElementById("ergebnis").innerText = "YOU WIN";
      document.getElementById("ergebnis").style.textAlign = "center";
      document.getElementById("ergebnis").style.lineHeight = "10em";
      document.getElementById("ergebnis").style.fontWeight = "bold";

      for (let x = 0; x < this.atomPosition.length; x++) {
        this.board[this.atomPosition[x][0] + 1][
          this.atomPosition[x][1] + 1
        ].style.background = "green";
      }
    }
  },

  showPfeil(x, y, cla) {
    this.board[x][y].classList.add(cla);
    setTimeout(() => {
      this.resetPfeil(x, y);
    }, 3000);
  },

  setFile(pos, side) {
    //Start
    if (side === "top") {
      this.showPfeil(this.beginPosition + 1, 0, "pfeilunten");
    } else if (side === "bottom") {
      this.showPfeil(this.beginPosition + 1, this.height - 1, "pfeiloben");
    } else if (side === "left") {
      this.showPfeil(0, this.beginPosition + 1, "pfeilrechts");
    } else if (side === "right") {
      this.showPfeil(this.width - 1, this.beginPosition + 1, "pfeillinks");
    }
  },

  async resetPfeil(x, y) {
    console.log(x, y);
    console.log(this.board[x][y]);
    if (parseInt(x) > this.width - 1 || parseInt(y) > this.height - 1) return;

    this.board[parseInt(x)][parseInt(y)].classList.remove(
      "pfeilunten",
      "pfeilrechts",
      "pfeillinks",
      "pfeiloben",
      "doppeloben",
      "doppelrechts"
    );
  },

  buildBoard() {
    const board = [];

    for (let y = 0; y < this.width; y++) {
      board.push([]);
      for (let x = 0; x < this.height; x++) {
        board[y].push("0");
      }
    }

    return board;
  },

  buildHtmlBoard() {
    const brett = document.querySelector("#Spiel");

    //Spielfläche
    brett.style.width = this.width * 10 + "vmin";
    brett.style.height = this.height * 10 + "vmin";

    //Felder
    let breite = 100 / this.width;
    let hoehe = 100 / this.height;

    //################# Board bauen #######################
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let feld = document.createElement("div");

        feld.classList.add("felder");
        feld.setAttribute("data-x", x);
        feld.setAttribute("data-y", y);

        feld.style.width = breite + "%";
        feld.style.height = hoehe + "%";
        brett.appendChild(feld);
        this.board[x][y] = feld;
        this.board[x][y].addEventListener("click", (event) =>
          this.atomeclick(event)
        );
      }
    }

    //############## Border bauen #########################

    //left
    for (let y = 1; y < this.height - 1; y++) {
      //HTML-board
      this.board[0][y].classList.add("test");
      this.board[0][y].setAttribute("data-Border", "left");

      //Logik-board

      this.board[0][y].addEventListener("click", (event) => this.click(event));
    }

    //top
    for (let x = 1; x < this.width - 1; x++) {
      //HTML-board
      this.board[x][0].classList.add("test");
      this.board[x][0].setAttribute("data-Border", "top");

      //Logik-board

      this.board[x][0].addEventListener("click", (event) => this.click(event));
    }

    //bottom
    for (let x = 1; x < this.width - 1; x++) {
      //HTML-board
      this.board[x][this.height - 1].classList.add("test");
      this.board[x][this.height - 1].setAttribute("data-Border", "bottom");

      //Logik-board
      this.board[x][this.height - 1].addEventListener("click", (event) =>
        this.click(event)
      );
    }

    //right
    for (let y = 1; y < this.height - 1; y++) {
      //HTML-board
      this.board[this.width - 1][y].classList.add("test");
      this.board[this.width - 1][y].setAttribute("data-Border", "right");

      //Logik-board
      this.board[this.width - 1][y].addEventListener("click", (event) =>
        this.click(event)
      );
    }
  },

  async click(event) {
    if (this.input) {
      this.resetPfeil(this.currentstart[0], this.currentstart[1]);
      this.resetPfeil(this.currentend[0], this.currentend[1]);
      let clicked = event.target;
      side = clicked.getAttribute("data-Border");
      this.sidecliked = side;
      x = parseInt(clicked.getAttribute("data-x"));
      y = parseInt(clicked.getAttribute("data-y"));
      this.currentstart[0] = x;
      this.currentstart[1] = y;

      //Position
      if (this.currentstart[0] === 0) {
        this.beginPosition = this.currentstart[1] - 1;
      } else if (this.currentstart[0] === this.width - 1) {
        this.beginPosition = this.currentstart[1] - 1;
      }

      if (this.currentstart[1] === 0) {
        this.beginPosition = this.currentstart[0] - 1;
      } else if (this.currentstart[1] === this.height - 1) {
        this.beginPosition = this.currentstart[0] - 1;
      }

      return this.ShootServer();
    }
  },
};
