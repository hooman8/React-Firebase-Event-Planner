import React, { Component } from "react";
import { compose } from "recompose";
import moment from "moment";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { withFirebase } from "../Firebase";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
    };
  }

  componentDidMount() {
    this.props.firebase.users().on("value", (snapshot) => {
      this.setState({
        users: snapshot.val(),
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    return (
      <div className="headingContent container">
        <h1>Home Page</h1>
        <p>The Home Page is accessible by every signed in user.</p>

        <Messages users={this.state.users} />
      </div>
    );
  }
}

class MessagesBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      programDate: moment(new Date()).format("YYYY-MM-DDTkk:mm"),
      zoomLink: "",
      youtubeLink: "",
      entity: "",
      lecturer: "",
      loading: false,
      messages: [],
      password: "",
      limit: 5,
      error: null,
    };
  }

  componentDidMount() {
    this.onListenForMessages();
  }

  onListenForMessages = () => {
    const currentUser = JSON.parse(localStorage.getItem("authUser"));
    this.setState({
      loading: true,
    });
    this.props.firebase
      .messages()
      .orderByChild("userId")
      .equalTo(currentUser.uid)
      .limitToLast(this.state.limit)
      .on("value", (snapshot) => {
        const messageObject = snapshot.val();

        if (messageObject) {
          const messageList = Object.keys(messageObject).map((key) => ({
            ...messageObject[key],
            uid: key,
          }));

          this.setState({
            messages: messageList,
            loading: false,
          });
        } else {
          this.setState({ messages: null, loading: false });
        }
      });
  };

  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  onChangeText = (event) => {
    if (event.target.name === "zoomLink") {
      const url = event.target.value.split("/j/");
      this.setState({ [event.target.name]: `j/${url[1]}` });
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  };

  onCreateMessage = (event, authUser) => {
    this.props.firebase
      .messages()
      .push({
        text: this.state.text,
        programDate: this.state.programDate,
        zoomLink: this.state.zoomLink,
        youtubeLink: this.state.youtubeLink,
        password: this.state.password,
        entity: this.state.entity,
        lecturer: this.state.lecturer,
        userId: authUser.uid,
        createdAt: this.props.firebase.serverValue.TIMESTAMP,
      })
      .catch((error) => {
        this.setState({ error });
      });

    this.setState({
      text: "",
      programDate: moment(new Date()).format("YYYY-MM-DDTkk:mm"),
      zoomLink: "",
      youtubeLink: "",
      entity: "",
      password: "",
      lecturer: "",
    });

    event.preventDefault();
  };

  onEditMessage = (message, text) => {
    this.props.firebase
      .message(message.uid)
      .set({
        ...message,
        text,
        editedAt: this.props.firebase.serverValue.TIMESTAMP,
      })
      .catch((error) => {
        this.setState({ error });
      });
  };

  onRemoveMessage = (uid) => {
    this.props.firebase
      .message(uid)
      .remove()
      .catch((error) => this.setState({ error }));
  };

  onNextPage = () => {
    this.setState(
      (state) => ({ limit: state.limit + 5 }),
      this.onListenForMessages
    );
  };

  render() {
    const { users } = this.props;
    const {
      text,
      programDate,
      zoomLink,
      youtubeLink,
      entity,
      lecturer,
      messages,
      password,
      loading,
    } = this.state;

    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <div>
            {loading && <div>Loading ...</div>}

            {messages && (
              <MessageList
                messages={messages.map((message) => ({
                  ...message,
                  user: users
                    ? users[message.userId]
                    : { userId: message.userId },
                }))}
                onEditMessage={this.onEditMessage}
                onRemoveMessage={this.onRemoveMessage}
              />
            )}

            {!messages && <div>There are no messages ...</div>}
            {!loading && messages && (
              <Button variant="primary" onClick={this.onNextPage}>
                Load More Messages
              </Button>
            )}
            <Container className="py-3">
              <Form onSubmit={(event) => this.onCreateMessage(event, authUser)}>
                <Form.Group>
                  <Row>
                    <Col>
                      <Form.Label>Entity | Organization:</Form.Label>
                      <input
                        name="entity"
                        type="text"
                        value={entity}
                        onChange={this.onChangeText}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group>
                  <Row>
                    <Col>
                      <Form.Label>Title:</Form.Label>
                      <input
                        name="text"
                        type="text"
                        value={text}
                        onChange={this.onChangeText}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group>
                  <Row>
                    <Col>
                      <Form.Label>Lecturer:</Form.Label>
                      <input
                        name="lecturer"
                        type="text"
                        value={lecturer}
                        onChange={this.onChangeText}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Program Date:</Form.Label>
                  <input
                    type="datetime-local"
                    id="meeting-time"
                    value={programDate}
                    name="programDate"
                    min="{2021-01-14T00:00}"
                    max="2021-06-14T00:00"
                    onChange={this.onChangeText}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Zoom URL:</Form.Label>
                  <input
                    name="zoomLink"
                    type="text"
                    value={zoomLink}
                    onChange={this.onChangeText}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Zoom's Session Password:</Form.Label>
                  <input
                    name="password"
                    type="text"
                    value={password}
                    onChange={this.onChangeText}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>YouTube URL:</Form.Label>
                  <input
                    name="youtubeLink"
                    type="text"
                    value={youtubeLink}
                    onChange={this.onChangeText}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Send
                </Button>
              </Form>
            </Container>

            {this.state.error && <span>{this.state.error.message}</span>}
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const MessageList = ({ messages, onEditMessage, onRemoveMessage }) => (
  <ul>
    {messages.map((message) => (
      <MessageItem
        key={message.uid}
        message={message}
        programDate={message.programDate}
        onEditMessage={onEditMessage}
        onRemoveMessage={onRemoveMessage}
      />
    ))}
  </ul>
);

class MessageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editText: this.props.message.text,
    };
  }

  onToggleEditMode = () => {
    this.setState((state) => ({
      editMode: !state.editMode,
      editText: this.props.message.text,
    }));
  };

  onChangeEditText = (event) => {
    this.setState({ editText: event.target.value });
  };

  onSaveEditText = () => {
    this.props.onEditMessage(this.props.message, this.state.editText);

    this.setState({ editMode: false });
  };

  render() {
    const { message, onRemoveMessage } = this.props;
    const { editMode, editText } = this.state;

    return (
      <>
        <li>
          {editMode ? (
            <input
              type="text"
              value={editText}
              onChange={this.onChangeEditText}
            />
          ) : (
            <span>
              <strong>{message.user.username || message.user.userId}</strong>{" "}
              {message.text} {message.programDate}
              {message.editedAt && <span>(Edited)</span>}
            </span>
          )}

          {editMode ? (
            <span>
              <button onClick={this.onSaveEditText}>
                <i className="fas fa-save"></i>
              </button>
              <button onClick={this.onToggleEditMode}>
                <i className="fas fa-eject"></i>
              </button>
            </span>
          ) : (
            <button onClick={this.onToggleEditMode}>
              <i className="fas fa-edit"></i>
            </button>
          )}

          {!editMode && (
            <button type="button" onClick={() => onRemoveMessage(message.uid)}>
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </li>
      </>
    );
  }
}

const condition = (authUser) => !!authUser;

const Messages = compose(
  withFirebase,
  withAuthorization(condition)
)(MessagesBase);

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition)
)(HomePage);
