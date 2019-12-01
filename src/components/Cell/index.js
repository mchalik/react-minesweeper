import React from "react";
import Proptypes from "prop-types";
import "./style.css";

export default class Cell extends React.Component {
  getValue() {
    const { value } = this.props;

    if (!value.isRevealed) {
      return value.isFlagged && "🚩";
    }
    if (value.isMine) {
      console.log("value", value);
      return "💣";
    }
    if (value.neighbour === 0) {
      return null;
    }
    return value.neighbour;
  }
  render() {
    console.log(this.props);
    const { value, onClick, cMenu } = this.props;
    return (
      <div onClick={onClick} onContextMenu={cMenu} className={`cell ${value.isRevealed && 'cell_revealed'}`}>
        {this.getValue()}
      </div>
    );
  }
}

const cellItemShape = {
  isRevealed: Proptypes.bool,
  isMine: Proptypes.bool,
  isEmpty: Proptypes.bool,
  isFlagged: Proptypes.bool,
  neighbour: Proptypes.number,
  x: Proptypes.number,
  y: Proptypes.number
};

Cell.propTypes = {
  value: Proptypes.objectOf(Proptypes.shape(cellItemShape)),
  onClick: Proptypes.func,
  cMenu: Proptypes.func
};
