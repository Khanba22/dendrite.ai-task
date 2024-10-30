import { MouseEventHandler } from "react";

interface Props {
  onClick?: MouseEventHandler;
  text: string;
  background?: string;
  color?: string;
}

const Buttons = (props: Props) => {
  return (
    <button
      style={{ background: props.background, color: props.color }}
      className="btn btn-primary bg-black"
      onClick={props.onClick ? props.onClick : () => {}}
    >
      {props.text}
    </button>
  );
};

export default Buttons;
