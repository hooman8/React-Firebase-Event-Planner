import React from "react";
import { Link } from "react-router-dom";
import { AuthUserContext } from "../Session";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { Navbar, Nav, Container } from "react-bootstrap";
import logo from "../../icon-120.png";
const Navigation = () => (
  <AuthUserContext.Consumer>
    {(authUser) =>
      authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => (
  <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
    <Container>
      <Navbar.Brand href="/">
        <img
          src={logo}
          width="60"
          height="60"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link href={ROUTES.LANDING}>
            <i className="fas fa-home"></i>Home
          </Nav.Link>
          <Nav.Link href={ROUTES.HOME}>
            <i className="fas fa-home"></i>Manage Posts
          </Nav.Link>
          <Nav.Link href={ROUTES.ACCOUNT}>
            <i className="far fa-user-circle"></i>Account
          </Nav.Link>
          <Nav.Link href={ROUTES.BOOKMARKS}>
            <i className="far fa-bookmark"></i> Bookmarks
          </Nav.Link>
          <Nav.Link href={ROUTES.ARCHIVE}>
            <i className="fas fa-archive"></i> Archive
          </Nav.Link>
          {!!authUser.roles[ROLES.ADMIN] && (
            <Nav.Link href={ROUTES.ADMIN}>
              <Link to={ROUTES.ADMIN}>Admin</Link>
            </Nav.Link>
          )}
          <li>
            <SignOutButton />
          </li>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

const NavigationNonAuth = () => (
  <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
    <Container>
      <Navbar.Brand href="/">
        <img
          src={logo}
          width="60"
          height="60"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link href={ROUTES.LANDING}>
            <i className="fas fa-home"></i>Home
          </Nav.Link>
          <Nav.Link href={ROUTES.SIGN_IN}>
            <i className="fas fa-sign-in-alt"></i>Sign In
          </Nav.Link>
          <Nav.Link href={ROUTES.BOOKMARKS}>
            <i className="far fa-bookmark"></i> Bookmarks
          </Nav.Link>
          <Nav.Link href={ROUTES.ARCHIVE}>
            <i className="fas fa-archive"></i> Archive
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default Navigation;
