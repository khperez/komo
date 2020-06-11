import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function VotingView({
  categories, categoryLetter, allAnswers,
  onChange, voteResults, onSubmitVotes,
  numPlayers
}) {
  let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
  categories.map(category => {
    var onlyAnswers = [];
    var allAnswersOne = allAnswers[category.id]
    Object.keys(allAnswersOne).map(uid => {
      onlyAnswers.push(allAnswersOne[uid].value.toLowerCase())
    })
    onlyAnswers = [...new Set(findDuplicates(onlyAnswers))]
    if (onlyAnswers.length != 0 || onlyAnswers !== undefined) {
      Object.keys(allAnswersOne).map(uid => {
        if (onlyAnswers.includes(allAnswersOne[uid].value.toLowerCase())) {
          allAnswersOne[uid].valid = false
        }
      })
    }
  })

  var checkboxes =
  <div className="Voting-categories-checkboxes">
  {categories.map(category => {
    var allAnswersForOneCategory = allAnswers[category.id]

    return  <div key={category.id}>
    <div className="Vote-category">{category.name}</div>
    {Object.keys(allAnswersForOneCategory).map(uid=> {
      const answer = allAnswersForOneCategory[uid]

      if (answer.valid) {
        return <Form key={category.id + uid}>
        <Form.Group>
          <Form.Check type="checkbox"
          checked={voteResults[category.id][uid]}
          onChange={onChange.bind(this, category.id, uid)}
          label={answer.value}/>
        </Form.Group>
        </Form>

      } else {
        return <Form key={category.id + uid}>
        <Form.Group>
        <Form.Check type="checkbox"
        checked={voteResults[category.id][uid]}
        onChange={onChange.bind(this, category.id, uid)}
        label={answer.value + " (Bad answer, boo!)"}
        disabled/>
        </Form.Group>
        </Form>
      }
    })}
    </div>
  })}
  </div>

  return (
    <div className="Vote-view">
      {checkboxes}
    </div>
    )
  }