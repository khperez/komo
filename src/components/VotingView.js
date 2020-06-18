import React from 'react';
import Form from 'react-bootstrap/Form';

export default function VotingView({
  categories,
  categoryLetter,
  allAnswers,
  onChange,
  voteResults,
  onSubmitVotes,
  numPlayers,
}) {
  var checkboxes = (
    <div className="Voting-categories-checkboxes">
      {categories.map((category) => {
        var allAnswersForOneCategory = allAnswers[category.id];

        return (
          <div key={category.id}>
            <div className="Game-form-label">
              <span className="Game-form-input-index">{category.id + 1}</span> {category.name}
            </div>
            {Object.keys(allAnswersForOneCategory).map((uid) => {
              const answer = allAnswersForOneCategory[uid];

              if (answer.valid) {
                return (
                  <Form key={category.id + uid}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        checked={voteResults[category.id][uid]}
                        onChange={onChange.bind(this, category.id, uid)}
                        label={answer.value}
                      />
                    </Form.Group>
                  </Form>
                );
              } else {
                return (
                  <Form key={category.id + uid}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        checked={voteResults[category.id][uid]}
                        onChange={onChange.bind(this, category.id, uid)}
                        label={answer.value + ' (Bad answer, boo!)'}
                        disabled
                      />
                    </Form.Group>
                  </Form>
                );
              }
            })}
          </div>
        );
      })}
    </div>
  );

  return <div className="Vote-view">{checkboxes}</div>;
}
