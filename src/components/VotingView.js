import React from 'react';
import Form from 'react-bootstrap/Form';

export default function VotingView({ categories, allAnswers, onChange }) {

    var checkboxes =
    <div>
        {categories.map(category => {
            var allAnswersForOneCategory = allAnswers[category.id]

            return  <div key={category.id}>
                        <h2 >{category.name}</h2>
                        {Object.keys(allAnswersForOneCategory).map(uid=> {
                            const answer = allAnswersForOneCategory[uid].value
                            return <Form onChange={onChange.bind(this, category.id, uid)} key={category.id + uid}>
                                       <Form.Group>
                                           <Form.Check type="checkbox" label={answer}/>
                                       </Form.Group>
                                   </Form>
                        })}
                    </div>
        })}
    </div>

    return (
        <div>
            <h1>Voting View</h1>
            {checkboxes}
        </div>
    )
}