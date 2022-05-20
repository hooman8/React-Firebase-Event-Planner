import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import moment from "moment";
import Footer from "../Footer/Footer";
import { Button, Alert } from "react-bootstrap";

const ProgramPage = ({ match }) => {
  const id = match.params.id;
  return (
    <div>
      <Program id={id} />
    </div>
  );
};

class ProgramBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      message: null,
      fileName: null,
      uploadInProgress: null,
      bytesTransferred: 0,
      totalBytes: 0,
      successfulUpload: null,
      uploadFailed: null,
      audioSrc: null,
    };
    this.uploadFile = this.uploadFile.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.fileInput = React.createRef();
  }
  componentDidMount() {
    if (this.state.message) {
      return;
    }
    this.setState({ loading: true });
    this.props.firebase.message(this.props.id).on("value", (snapshot) => {
      this.setState({
        message: snapshot.val(),
        loading: false,
      });
    });
    const fileRef = this.props.firebase.lectures(this.props.id);
    if (fileRef) {
      fileRef.listAll().then((result) => {
        result.items.forEach((item) => {
          item.getDownloadURL().then((url) => {
            this.setState({
              audioSrc: url,
            });
          });
        });
      });
    }
  }

  componentWillUnmount() {
    this.props.firebase.message(this.props.id).off();
  }
  downloadFile = (folderName, fileName) => {
    return new Promise((resolve) => {
      const fileRef = this.props.firebase.lecture(folderName, fileName);
      fileRef
        .getDownloadURL()
        .then((url) => resolve(url))
        .catch((error) => console.error(error));
    });
  };
  uploadFile = (event) => {
    this.setState({
      fileName: this.fileInput.current.files[0].name,
      uploadInProgress: true,
    });

    const uploadTask = this.props.firebase
      .lecture(`${this.props.id}`, `${this.fileInput.current.files[0].name}`)
      .put(this.fileInput.current.files[0]);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        this.setState({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        this.setState({
          successfulUpload: false,
          uploadFailed: error.message,
        });
      },
      () => {
        this.downloadFile(
          this.props.id,
          this.fileInput.current.files[0].name
        ).then((fileUrl) => {
          this.setState({
            audioSrc: fileUrl,
            uploadInProgress: false,
            successfulUpload: true,
          });
        });
      }
    );
    event.preventDefault();
  };

  render() {
    const {
      message,
      loading,
      uploadInProgress,
      bytesTransferred,
      totalBytes,
      successfulUpload,
      uploadFailed,
      audioSrc,
    } = this.state;
    return (
      <div className="page">
        <div className="interactions">
          {loading && (
            <div>
              <i className="fas fa-spinner"></i>
            </div>
          )}
          {audioSrc ? (
            <div>
              <figure>
                <figcaption>
                  Listen to <span>{message.text}</span>
                  <span>
                    <strong> by</strong> {message.lecturer}
                  </span>
                  <span>
                    {" "}
                    {moment(message.programDate).format("MMM Do YYYY")}
                  </span>
                </figcaption>
                <audio controls src={audioSrc}>
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
              </figure>
            </div>
          ) : (
            <form onSubmit={this.uploadFile}>
              <Alert variant="warning">
                It looks like we don't have the recording. Please share it with
                the community if you're authorized to do so.You have to be
                logged in to upload recording. MP3 only and resource size cannot
                be more than 100mb
              </Alert>
              <label>
                Upload recording:
                <input id="song-file" type="file" ref={this.fileInput} />
              </label>
              <Button variant="primary" type="submit">
                Upload
              </Button>
              {uploadInProgress ? (
                <Alert variant="success">
                  Byes transfered: {bytesTransferred}
                  Total Bytes: {totalBytes}
                </Alert>
              ) : null}
              {uploadFailed && <Alert variant="danger">{uploadFailed}</Alert>}
              {successfulUpload && (
                <Alert variant="success">File successfully Uploaded</Alert>
              )}
            </form>
          )}

          <div className="interactions"></div>
        </div>
        <Footer />
      </div>
    );
  }
}

const Program = withFirebase(ProgramBase);

export default ProgramPage;
