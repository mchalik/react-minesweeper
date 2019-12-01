import React from "react";
import Board from "../Board";

export default class Game extends React.Component {
  state = {
    width: 8,
    height: 8,
    mines: 10
  };

  render() {
    const { width, height, mines } = this.state;

    return (
      <div className="game">
        <Board width={width} height={height} mines={mines} />
      </div>
    );
  }
}
