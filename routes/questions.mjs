import { Router } from "express";
import {
  validateCreateQuestions,
  validateDeleteQuestion,
  validateUpdateQuestion,
} from "../middleware/questions.validation.mjs";
import { validateCreateNewAnswer } from "../middleware/answers.validation.mjs";

import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

questionsRouter.post("/", [validateCreateQuestions], async (req, res) => {
  const newQuestions = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    await connectionPool.query(
      `
      insert into questions 
      (title,description,category,created_at,updated_at)
      values ($1,$2,$3,$4,$5)
       `,
      [
        newQuestions.title,
        newQuestions.description,
        newQuestions.category,
        newQuestions.created_at,
        newQuestions.updated_at,
      ]
    );
  } catch {
    return res
      .status(500)
      .json({ message: "Could not create questions because datebase issue" });
  }

  return res
    .status(201)
    .json({ message: "201 Created: Question created successfully" });
});

questionsRouter.get("/:questionId", async (req, res) => {
  let result;
  const questionIdFromClient = req.params.questionId;

  try {
    result = await connectionPool.query(
      `
     select * from questions
     where id = $1
      `,
      [questionIdFromClient]
    );
  } catch {
    return res
      .status(500)
      .json({ message: "Could not get the question because database issue" });
  }

  if (!result.rows[0]) {
    return res
      .status(404)
      .json({ message: "404 Not Found: Question not found" });
  }

  return res.status(200).json({ data: result.rows });
});

questionsRouter.get("/", async (req, res) => {
  let result;

  const title = req.query.title;
  const category = req.query.category;

  try {
    result = await connectionPool.query(
      `
        select * from questions
        where 
        (title = $1 or $1 is null or $1 = '') 
        and
        (category = $2 or $2 is null or $2 = '')
        `,
      [title, category]
    );
  } catch {
    return res
      .status(500)
      .json({ message: "Could not get the questions because database issue" });
  }

  if (!result.rows[0]) {
    return res
      .status(400)
      .json({ message: "400 Bad Request: Invalid query parameters." });
  }

  return res.status(200).json({ data: result.rows });
});

questionsRouter.put(
  "/:questionId",
  [validateUpdateQuestion],
  async (req, res) => {
    const questionIdFromClient = req.params.questionId;

    const editedQuestion = { ...req.body, updated_at: new Date() };

    try {
      await connectionPool.query(
        `
        update questions
        set title = $2 , 
            description = $3,
            updated_at = $4
            where id = $1
        `,
        [
          questionIdFromClient,
          editedQuestion.title,
          editedQuestion.description,
          editedQuestion.updated_at,
        ]
      );
    } catch {
      return res.status(500).json({
        message: "Could not update the question because database issue",
      });
    }

    return res.status(200).json({
      message: `200 OK: Successfully updated the question`,
    });
  }
);

questionsRouter.delete(
  "/:questionId",
  [validateDeleteQuestion],
  async (req, res) => {
    const questionIdFromClient = req.params.questionId;

    try {
      await connectionPool.query(`delete from questions where id = $1`, [
        questionIdFromClient,
      ]);
    } catch {
      return res.status(500).json({
        message: "Could not delete the question because database issue",
      });
    }

    return res.status(200).json({
      message: `200 OK: Successfully deleted the question`,
    });
  }
);

questionsRouter.post(
  "/:questionId/answers",
  [validateCreateNewAnswer],
  async (req, res) => {
    const questionIdFromClient = req.params.questionId;

    const newAnswers = {
      ...req.body,
      questionIdFromClient,
      created_at: new Date(),
      updated_at: new Date(),
    };

    try {
      await connectionPool.query(
        `
        insert into answers (question_id ,content,created_at,updated_at)
        values ($1,$2,$3,$4)
        `,
        [
          questionIdFromClient,
          newAnswers.content,
          newAnswers.created_at,
          newAnswers.updated_at,
        ]
      );
    } catch {
      return res.status(500).json({
        message: "Could not create new answer because database issue",
      });
    }

    return res
      .status(201)
      .json({ message: "201 Created: Answer created successfully." });
  }
);

questionsRouter.get("/:questionId/answers", async (req, res) => {
  let result;
  const questionIdFromClient = req.params.questionId;

  try {
    result = await connectionPool.query(
      `
        select * from answers
        where question_id = $1
      `,
      [questionIdFromClient]
    );
  } catch {
    return res
      .status(500)
      .json({ message: "Could not get the answers because database issue" });
  }

  if (!result.rows[0]) {
    return res
      .status(404)
      .json({ message: "404 Not Found: Question not found." });
  }

  return res.status(200).json({ data: result.rows });
});

questionsRouter.put("/:questionId/upvote", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  const updatedVote = { ...req.body, updated_at: new Date() };

  if (req.body.vote !== 1) {
    return res.status(400).json({ message: "You can upvote just 1" });
  }

  try {
    await connectionPool.query(
      `
        update question_votes
        set vote = $2 , 
        updated_at = $3
        where question_id = $1
        `,
      [questionIdFromClient, updatedVote.vote, updatedVote.updated_at]
    );
  } catch {
    return res.status(500).json({
      message: "Could not upvote the question because database issue",
    });
  }

  return res
    .status(200)
    .json({ message: "200 OK: Successfully upvoted the question." });
});

questionsRouter.put("/:questionId/downvote", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  const updatedVote = { ...req.body, updated_at: new Date() };

  if (req.body.vote !== -1) {
    return res.status(400).json({ message: "You can downvote just -1" });
  }

  try {
    await connectionPool.query(
      `
        update question_votes
        set vote = $2 , 
        updated_at = $3
        where question_id = $1
        `,
      [questionIdFromClient, updatedVote.vote, updatedVote.updated_at]
    );
  } catch {
    return res.status(500).json({
      message: "Could not downvote the question because database issue",
    });
  }

  return res
    .status(200)
    .json({ message: "200 OK: Successfully downvote the question." });
});

export default questionsRouter;
