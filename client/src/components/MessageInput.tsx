import { Button, TextField } from "@mui/material";
import cx from "classnames";
import React, { ChangeEvent, MouseEvent, useState } from "react";

import styles from "../styles/MessageInput.module.css";

interface IProps {
  /**
   * Additional class name to be applied to the component
   */
  className?: string;
  /**
   * Function that will be called when the form is submitted
   */
  onSubmit: (text: string) => void;
}

const MessageInput: React.FC<IProps> = ({ className, onSubmit }) => {
  const [content, setContent] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (content) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <form>
      <div className={cx(styles.root, className)}>
        <TextField
          className={styles.input}
          placeholder="Write a message here..."
          value={content}
          onChange={onChange}
        />
        <Button
          variant={!content ? "text" : "contained"}
          color="primary"
          type="submit"
          onClick={handleSubmit}
        >
          Send
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
