import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer>
      <Container>
        <div>
          <Row>
            <Col className="text-center pt-5">
              Copyright &copy; Shia Progs 2021
            </Col>
          </Row>
          <Row>
            <Col className="text-center py-1">
              <a href="https://www.patreon.com/shiacommunity">
                <i className="fab fa-patreon"></i> Support the Project
              </a>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
