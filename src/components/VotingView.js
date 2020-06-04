import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function VotingView({
    categories, categoryLetter, allAnswers,
    onChange, voteResults, onSubmitVotes
}) {
    var checkboxes =
    <div>
        {categories.map(category => {
            var allAnswersForOneCategory = allAnswers[category.id]

            return  <div key={category.id}>
                        <h2 >{category.name}</h2>
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
        <div>
            <h1>Voting View (Letter: {categoryLetter})</h1>
            {checkboxes}
            <Button onClick={onSubmitVotes}>Submit Votes</Button>
        </div>
    )
}