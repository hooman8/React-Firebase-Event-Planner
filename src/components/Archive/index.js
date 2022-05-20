import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import {
  Button,
  Row,
  Col,
  Card,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import moment from "moment";
import { sortBy } from "lodash";
import { AuthUserContext } from "../Session";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";

const SORTS = {
  NONE: (list) => list,
  ENTITY: (list) => sortBy(list, "entity"),
  LECTURER: (list) => sortBy(list, "lecturer"),
  DATE: (list) => sortBy(list, "programDate"),
};

const Sort = ({ sortKey, onSort, children }) => (
  <Button onClick={() => onSort(sortKey)}>
    <i className="fas fa-sort-amount-down"></i>
    {children}
  </Button>
);
const isSearched = (searchTerm) => (item) =>
  item.text.toLowerCase().includes(searchTerm.toLowerCase());

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: "NONE",
      isSortReverse: false,
    };
    this.onSort = this.onSort.bind(this);
  }
  onSort(sortKey) {
    const isSortReverse =
      this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const { list, searchTerm } = this.props;
    const { sortKey, isSortReverse } = this.state;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

    return (
      <>
        <h1>Archived Programs</h1>
        <div className="table-header">
          <Sort sortKey={"ENTITY"} onSort={this.onSort}>
            Host
          </Sort>
          <Sort sortKey={"DATE"} onSort={this.onSort}>
            Date
          </Sort>
          <Sort sortKey={"LECTURER"} onSort={this.onSort}>
            Lecturer
          </Sort>
        </div>
        <Row>
          {reverseSortedList.filter(isSearched(searchTerm)).map((item) => (
            <Col key={item.uid} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded">
                <Card.Header>
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

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  render() {
    const { value, onChange, children } = this.props;
    return (
      <form>
        {children}
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={(el) => (this.input = el)}
        />
      </form>
    );
  }
}

const ArchivePage = () => (
  <div>
    <Messages />
  </div>
);

class MessagesBases extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      loading: false,
      messages: [],
      bookmarked: [],
      installButton: false,
      installPrompt: null,
      limit: 8,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
  }
  componentDidMount() {
    this.onListenForMessages();
  }

  onListenForMessages = () => {
    this.setState({ loading: true });
    this.props.firebase
      .messages()
      .orderByChild("programDate")
      .endAt(moment().format("YYYY-MM-DDTkk:mm"))
      .limitToLast(this.state.limit)
      .on("value", (snapshot) => {
        const messageObject = snapshot.val();
        if (messageObject) {
          //convert messages list from snapshot
          const messageList = Object.keys(messageObject).map((key) => ({
            ...messageObject[key],
            uid: key,
          }));
          this.setState({ messages: messageList, loading: false });
        } else {
          this.setState({ messages: null, loading: false });
        }
        this.setState({ loading: false });
      });
  };
  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onNextPage = () => {
    this.setState(
      (state) => ({ limit: state.limit + 5 }),
      this.onListenForMessages
    );
  };
  render() {
    const { searchTerm, messages, loading } = this.state;
    return (
      <div className="page">
        <div className="interactions">
          {loading && (
            <div>
              <i className="fas fa-spinner"></i>
            </div>
          )}
          <Search value={searchTerm} onChange={this.onSearchChange}>
            Search
          </Search>
          {messages ? (
            <Table list={messages} searchTerm={searchTerm} />
          ) : (
            <div>There are no messages</div>
          )}
          <div className="interactions">
            {!loading && messages && (
              <Button variant="primary" onClick={this.onNextPage}>
                <i className="fas fa-plus-circle"></i>
              </Button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const Messages = withFirebase(MessagesBases);

export default ArchivePage;
