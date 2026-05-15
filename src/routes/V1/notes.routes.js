import { Router } from "express";
import { notes } from "../../fakeData/fakeNotes.js";

export const router = Router();

//find all notes
router.get("/", (req, res) => {
  res.json(notes);
});

/// Create new note
router.post("/", (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) {
    return res.status(404).json("title and content are required");
  }

  const nextId = String(
    (notes.reduce((max, n) => Math.max(max, Number(n.id)), 0) || 0) + 1,
  );

  const newNote = { id: nextId, title, content };

  notes.push(newNote);
  return res.status(201).json(newNote);
});

//find note id
router.get("/:id", (req, res) => {
  const note = notes.find((n) => String(n.id) === String(req.params.id));
  if (!note) {
    return res.status(404).json({ error: "note not found" });
  }
  res.json(note);
});

//Update note
router.put("/:id", (req, res) => {
  const note = notes.find((n) => String(n.id) === String(req.params.id));

  if (!note) {
    return res.status(404).json({ error: "note not found" });
  }
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }

  note.title = title;
  note.content = content;

  res.status(200).json(note);
});

// delete note
router.delete("/:id", (req, res) => {
  const note = notes.findIndex((n) => n.id === req.params.id);

  if (note === -1) {
    return res.status(404).json({ error: "note not found" });
  }

  const deletednote = notes.splice(note, 1);

  res.status(200).json({
    message: "note deleted successfully",
    deletednote: deletednote[0],
  });
});
