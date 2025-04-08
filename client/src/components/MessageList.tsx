import { Container, Skeleton, Typography } from "@mui/material";
import React, { Fragment, useEffect } from "react";
import IMessage from "../models/Message";
import Message from "./Message";

interface IProps {
  /**
   * Additional class name to be applied to the component
   */
  className?: string;
  /**
   * List of messages to be displayed
   */
  messages: IMessage[];
  /**
   * Whether the messages are still loading
   */
  loading?: boolean;
}

const MessageList: React.FC<IProps> = (props: IProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { className, messages, loading } = props;
  useEffect(() => {
    !loading && scrollToTheEnd(ref);
  }, [loading, messages]);
  return (
    <Container className={className} ref={ref}>
      {loading ? (
        <Fragment>
          <Skeleton style={{ marginTop: 10 }} />
          <Skeleton animation={false} />
          <Skeleton animation="wave" />
        </Fragment>
      ) : messages && messages.length ? (
        messages.map((message) => (
          <Message key={message._id} message={message} />
        ))
      ) : (
        <Typography>No messages yet</Typography>
      )}
    </Container>
  );
};

const scrollToTheEnd = (ref: React.RefObject<HTMLDivElement>) => {
  if (ref.current && ref.current.lastChild) {
    const lastChild = ref.current.lastChild as Element;
    lastChild.scrollIntoView({
      behavior: "smooth",
    });
  }
};
export default MessageList;
