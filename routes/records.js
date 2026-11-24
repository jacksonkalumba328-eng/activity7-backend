const router = require("express").Router();
const pool = require("../db");

// Helper: validate body
function validateRecord(body) {
  const errors = [];
  const { title, category, description, status } = body;

  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 80) {
    errors.push("Title must be text of 3 to 80 characters.");
  }
  if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 40) {
    errors.push("Category must be text of 2 to 40 characters.");
  }
  if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 300) {
    errors.push("Description must be text of 5 to 300 characters.");
  }
  if (!["Pending", "In progress", "Completed"].includes(status)) {
    errors.push("Status must be one of: Pending, In progress, Completed.");
  }

  return errors;
}

// GET /api/records – all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/records/:id – one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/records – create
router.post("/", async (req, res, next) => {
  try {
    const errors = validateRecord(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const { title, category, description, status } = req.body;

    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, category, description, status`,
      [title.trim(), category.trim(), description.trim(), status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/records/:id – full update
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    const errors = validateRecord(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const { title, category, description, status } = req.body;

    const result = await pool.query(
      `UPDATE records
       SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5
       RETURNING id, title, category, description, status`,
      [title.trim(), category.trim(), description.trim(), status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({ message: "Record deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;