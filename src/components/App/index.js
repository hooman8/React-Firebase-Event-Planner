import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navigation from "../Navigation";
import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import BookmarksPage from "../Bookmarks";
import AccountPage from "../Account";
import AdminPage from "../Admin";
import ProgramPage from "../Program";
import ArchivePage from "../Archive";
import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";
import "../../index.css";

const App = () => (
  <Router>
    <div>
      <Navigation />
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} />
      <Route path={ROUTES.BOOKMARKS} component={BookmarksPage} />
      <Route path={ROUTES.ARCHIVE} component={ArchivePage} />
      <Route path="/program/:id" component={ProgramPage} />
    </div>
  </Router>
);

export default withAuthentication(App);
