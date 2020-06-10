import React from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default function ResultView({ scores }) {

  // Stupid way to check whether scores is empty or not, should be fixed
  // later on!
  const names = Reflect.ownKeys(scores)
  if (Object.entries(scores) !== 0) {
    var sortable = [];
    for (var score in scores) {
      sortable.push([score, scores[score]])
    }
    sortable.sort(function(a,b) {
      return b[1] - a[1];
    })
  }
  if (names.length === 0) {
    return (
      <div>
      <h1>Waiting for results...</h1>
      </div>
      )
    } else {
      return (
        <Container>
        <Row xs={2} md={4} lg={6} className="Result-heading">
        <Col>Player</Col>
        <Col className="Result-heading-score">Score</Col>
        </Row>
        { sortable.map(item => {
          return (
            <Row>
            <Col className="Result-player-name">
            {item[0]}<span className="Result-player-score">{item[1]}</span>
            </Col>
            </Row>
            )
        })}
          </Container>
          )
        }
      }