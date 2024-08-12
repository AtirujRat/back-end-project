import connectionPool from "../utils/db.mjs";

export const validateCreateNewAnswer = async (req, res, next) => {
  const questionIdFromClient = req.params.questionId;

  const isCorrectQuestionId = await connectionPool.query(
    `
        select * from questions
        where id = $1
        `,
    [questionIdFromClient]
  );

  if (!isCorrectQuestionId.rows[0]) {
    return res
      .status(404)
      .json({ message: "Could not found question to create the answer" });
  }

  if (!req.body.content) {
    return res
      .status(400)
      .json({ message: "400 Bad Request: Missing or invalid request data." });
  }

  if (req.body.content.length > 300) {
    return res.status(400).json({
      message: "400 Bad Request: Content must not greater than 300 characters",
    });
  }

  next();
};
