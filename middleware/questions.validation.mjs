import connectionPool from "../utils/db.mjs";

export const validateCreateQuestions = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({ message: "Missing title" });
  }
  if (!req.body.description) {
    return res.status(400).json({ message: "Missing description" });
  }

  const questionsCategoryList = [
    "Software",
    "Food",
    "Travel",
    "Science",
    "etc",
  ];

  if (!req.body.category) {
    return res.status(400).json({
      message: `Invalid category please send the correct category (${questionsCategoryList})`,
    });
  }

  next();
};

export const validateDeleteQuestion = async (req, res, next) => {
  const questionIdFromClient = req.params.questionId;
  const quetionID = await connectionPool.query(
    `
            select * from questions
              where id = $1
              `,
    [questionIdFromClient]
  );

  if (!quetionID.rows[0]) {
    return res
      .status(404)
      .json({ message: "404 Not Found: Question not found" });
  }

  next();
};

export const validateUpdateQuestion = async (req, res, next) => {
  const questionIdFromClient = req.params.questionId;

  const quetionID = await connectionPool.query(
    `
          select * from questions
            where id = $1
            `,
    [questionIdFromClient]
  );

  if (!quetionID.rows[0]) {
    return res
      .status(404)
      .json({ message: "404 Not Found: Question not found" });
  }

  if (!req.body.title) {
    return res.status(400).json({ meesage: "Missing title to update" });
  }
  if (!req.body.description) {
    return res.status(400).json({ meesage: "Missing description to update" });
  }

  next();
};
