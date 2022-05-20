import React, { Component } from "react";
import * as ROUTES from "../../constants/routes";
import moment from "moment";
import { AuthUserContext } from "../Session";
import { Link } from "react-router-dom";

import {
  Button,
  Row,
  Col,
  Card,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
class Table extends Component {
  render() {
    const { list, onDismiss } = this.props;
    return (
      <>
        <h1>Your Bookmarks</h1>
        <Row>
          {list.map((item) => (
            <Col key={item.uid} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded">
                <Card.Header>
                  <div
                    className="float-right"
                    variant="danger"
                    size="sm"
                    onClick={() => onDismiss(item.uid)}
                  >
                    <i className="fas fa-times-circle"></i>
                  </div>

                  <Card.Title as="div">
                    <strong>{item.text}</strong>
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    Public event; accessible via zoom; password needed
                  </Card.Text>
                  <ListGroup className="list-group-flush">
                    <ListGroupItem>Hosted By:{item.entity}</ListGroupItem>
                    <ListGroupItem>Lecturer:{item.lecturer}</ListGroupItem>
                    <ListGroupItem>
                      {moment(item.programDate).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      )}
                    </ListGroupItem>
                  </ListGroup>
                  <ListGroupItem>
                    {item.youtubeLink && (
                      <Button className="btn-block" variant="danger" size="sm">
                        <a
                          href={`${item.youtubeLink}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Youtune Live
                        </a>
                      </Button>
                    )}
                    {item.zoomLink && (
                      <Button className="btn-block" variant="success" size="sm">
                        <a
                          href={`https://us02web.zoom.us/${item.zoomLink}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join Via Zoom
                        </a>
                      </Button>
                    )}
                    {item.zoomLink && (
                      <AuthUserContext.Consumer>
                        {(authUser) =>
                          authUser ? (
                            <ListGroupItem>
                              Passcode: {item.password}
                            </ListGroupItem>
                          ) : (
                            <Link to={ROUTES.SIGN_IN}>
                              <small className="text-muted">
                                Passcode: Sign in to reveal
                              </small>
                            </Link>
                          )
                        }
                      </AuthUserContext.Consumer>
                    )}
                  </ListGroupItem>
                  Missed the Lecture? Listen to its recording{" "}
                  <Link to={`/program/${item.uid}`}>
                    <i className="far fa-play-circle"></i>
                  </Link>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    Posted on{" "}
                    {moment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }
}

const BookmarksPage = () => (
  <div>
    <Messages />
  </div>
);

class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    let arrBook = [];
    let bookmarks = Store.getBookmarks();
    bookmarks.forEach(function (bookmark) {
      bookmark.forEach(function (item) {
        arrBook.push(item);
      });
    });
    this.setState({ messages: arrBook });
  }
  onDismiss(id) {
    const messages = this.state.messages.filter(
      (message) => message.uid !== id
    );
    Store.removeBookmark(id);

    this.setState({ messages });
  }
  render() {
    const { messages } = this.state;
    return (
      <div className="page">
        <div className="interactions">
          {messages ? (
            <Table list={messages} onDismiss={this.onDismiss} />
          ) : (
            <div>There are no messages</div>
          )}
          <div>{messages.createdAt}</div>
        </div>
      </div>
    );
  }
}

class Store {
  static getBookmarks() {
    let bookmarks;
    if (localStorage.getItem("bookmarks") === null) {
      bookmarks = [];
    } else {
      bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    }
    return bookmarks;
  }
  static removeBookmark(id) {
    const bookmarks = Store.getBookmarks();
    bookmarks.forEach(function (bookmark, position) {
      bookmark.forEach(function (item) {
        if (item.uid === id) {
          bookmarks.splice(position, 1);
        }
      });
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    });
  }
}

export default BookmarksPage;
