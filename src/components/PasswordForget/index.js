import React, { Component } from 'react';
import { Link } from 'react-router-dom'; 
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const PasswordForgetPage = () => (
  <div className="headingContent">
    <h1>PasswordForget</h1>
    <PasswordForgetForm />
  </div>
);
const INITIAL_STATE = {
  email: '',
  error: null,
};
class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
  }
  onSubmit = event => {
    const { email } = this.state;
    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({...INITIAL_STATE});
      })
      .catch(error => this.setState({ error }));
    event.preventDefault();
  };
  onChange = event => {
    this.setState({[event.target.name] : event.target.value});
  };
  render() {
    const { email, error } = this.state;
    const isInvalid = email === '';

    return (
      <div className="signup container card bg-primary text-center card-form">
        <div className="card-body">
        <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <input
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
            />
        </div>

          <button className="btn btn-danger" disabled={isInvalid} type="submit">
            Reset My Password
          </button>
          {error && <p>{error.message}</p>}
        </form>
        </div>
      </div>

    );
  }
}
const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET}>Forget Password?</Link>
  </p>
);
export default PasswordForgetPage;
const PasswordForgetForm = withFirebase(PasswordForgetFormBase);
export { PasswordForgetForm, PasswordForgetLink };