import React from "react";
import Proptypes from "prop-types";
import Cell from "../Cell";

import "./style.css";

export default class Board extends React.Component {
  state = {
    boardData: this.initBoardData(
      this.props.height,
      this.props.width,
      this.props.mines
    ),
    gameStatus: false,
    mineCount: this.props.mines,
    gameStarted: false
  };
  createEmptyArray(width, height) {
    let data = [];
    for (let i = 0; i < height; i++) {
      data.push([]);
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: i,
          y: j,
          neighbour: 0,
          isMine: false,
          isEmpty: false,
          isRevealed: false,
          isFlagged: false
        };
      }
    }

    return data;
  }
  plantMines(data, width, height, mines) {
    let randomx,
      randomy,
      minesPlanted = 0;

    while (minesPlanted < mines) {
      randomx = this.getRandomNumber(width);
      randomy = this.getRandomNumber(height);
      if (!data[randomx][randomy].isMine) {
        data[randomx][randomy].isMine = true;
        minesPlanted++;
      }
    }
    return data;
  }
  getRandomNumber(number) {
    return Math.floor(Math.random() * 1000 + 1) % number;
  }
  getNeighbours(data, width, height) {
    let updatedData = data;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (data[i][j].isMine !== true) {
          let mine = 0;
          const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
          area.map(value => {
            if (value.isMine) {
              mine++;
            }
          });
          if (mine === 0) {
            updatedData[i][j].isEmpty = true;
          }
          updatedData[i][j].neighbour = mine;
        }
      }
    }
    return updatedData;
  }
  traverseBoard(x, y, data) {
    const el = [];
    const maxRight = this.props.width - 1;
    const maxBottom = this.props.height - 1;

    //up
    if (x > 0) {
      el.push(data[x - 1][y]);
    }

    //down
    if (x < maxBottom) {
      el.push(data[x + 1][y]);
    }

    //left
    if (y > 0) {
      el.push(data[x][y - 1]);
    }

    //right
    if (y < maxRight) {
      el.push(data[x][y + 1]);
    }

    //up left
    if (x > 0 && y > 0) {
      el.push(data[x - 1][y - 1]);
    }

    //up right
    if (x > 0 && y < maxRight) {
      el.push(data[x - 1][y + 1]);
    }

    //down right
    if (x < maxBottom && y < maxRight) {
      el.push(data[x + 1][y + 1]);
    }

    //down left
    if (x < maxBottom && y > 0) {
      el.push(data[x + 1][y - 1]);
    }

    return el;
  }
  initBoardData(height, width, mines) {
    let data = this.createEmptyArray(width, height);
    data = this.plantMines(data, width, height, mines);
    data = this.getNeighbours(data, width, height);
    console.log(data);
    return data;
  }
  handleCellClick(x, y) {
    if (!this.state.gameStarted) {
      if (this.state.boardData[x][y].isMine) {
        this.setState({
          boardData: this.initBoardData(
            this.props.height,
            this.props.width,
            this.props.mines
          )
        });
      }
      this.setState({ gameStarted: true });
    }

    let win;
    if (
      this.state.boardData[x][y].isRevealed ||
      this.state.boardData[x][y].isFlagged
    ) {
      return null;
    }

    if (this.state.boardData[x][y].isMine) {
      this.setState({ gameStatus: "Game lost!" });
      this.revealBoard(() => alert("Game over!"));
      win = false;
    }

    let updatedData = this.state.boardData;
    updatedData[x][y].isRevealed = true;
    updatedData[x][y].isFlagged = false;

    if (updatedData[x][y].isEmpty) {
      updatedData = this.revealEmpty(x, y, updatedData);
    }

    if (this.getHidden(updatedData).length === this.props.mines) {
      win = true;
      this.setState({ gameStatus: "Yoy win!" });
    }

    this.setState({
      boardData: updatedData,
      mineCount: this.props.mines - this.getFlags(updatedData).length,
      gameWon: win
    });
  }
  revealEmpty(x, y, data) {
    let area = this.traverseBoard(x, y, data);
    area.map(value => {
      if (!value.isRevealed && (value.isEmpty || !value.isMine)) {
        data[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          this.revealEmpty(value.x, value.y, data);
        }
      }
    });
    return data;
  }
  handleContextMenu(event, x, y) {
    event.preventDefault();
    let updatedData = this.state.boardData;
    let mines = this.state.mineCount;
    let win = false;

    if (updatedData[x][y].isRevealed) return;

    if (updatedData[x][y].isFlagged) {
      updatedData[x][y].isFlagged = false;
      mines++;
    } else {
      updatedData[x][y].isFlagged = true;
      mines--;
    }

    if (mines === 0) {
      const mineArray = this.getMines(updatedData);
      const flagArray = this.getFlags(updatedData);
      if (JSON.stringify(mineArray) === JSON.stringify(flagArray)) {
        this.revealBoard();
        alert("You win!");
      }
    }

    this.setState({
      boardData: updatedData,
      mineCount: mines,
      gameWon: win
    });
  }
  getMines(data) {
    const mines = [];
    data.forEach(dataRow => {
      dataRow.forEach(dataItem => {
        dataItem.isMine && mines.push(dataItem);
      });
    });
    return mines;
  }
  getFlags(data) {
    const mines = [];
    data.forEach(dataRow => {
      dataRow.forEach(dataItem => {
        dataItem.isFlagged && mines.push(dataItem);
      });
    });
    return mines;
  }
  getHidden(data) {
    const mines = [];
    data.forEach(dataRow => {
      dataRow.forEach(dataItem => {
        !dataItem.isRevealed && mines.push(dataItem);
      });
    });
    return mines;
  }
  revealBoard(callback) {
    const updatedData = this.state.boardData;
    updatedData.forEach(dataRow => {
      dataRow.forEach(dataItem => {
        dataItem.isRevealed = true;
      });
    });
    this.setState({ boardData: updatedData }, callback);
  }
  resetGame() {
    console.log(this.state.gameStarted);
    if (this.state.gameStarted) {
      this.setState({
        boardData: this.initBoardData(
          this.props.height,
          this.props.width,
          this.props.mines
        ),
        gameStarted: false
      });
    }
  }

  renderBoard(data) {
    return data.map(dataRow =>
      dataRow.map(dataItem => (
        <React.Fragment key={dataItem.x * dataRow.length + dataItem.y}>
          <Cell
            onClick={() => this.handleCellClick(dataItem.x, dataItem.y)}
            cMenu={e => this.handleContextMenu(e, dataItem.x, dataItem.y)}
            value={dataItem}
          />
          {dataRow[dataRow.length - 1] === dataItem && (
            <div className="clear" />
          )}
        </React.Fragment>
      ))
    );
  }
  render() {
    return (
      <div className="board">
        <div className="game-info">
          <span className="info">mines: {this.state.mineCount}</span>
          <span className="info">{this.state.gameStatus}</span>
        </div>
        <div className="field">{this.renderBoard(this.state.boardData)}</div>
        <button type="button" onClick={() => this.resetGame()}>
          Start again
        </button>
      </div>
    );
  }
}

Board.propTypes = {
  height: Proptypes.number,
  width: Proptypes.number,
  mines: Proptypes.number
};
