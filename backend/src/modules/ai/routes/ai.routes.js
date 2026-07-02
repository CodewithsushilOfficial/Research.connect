const express = require("express");
const router = express.Router();
const path = require("path");
const aiController = require("../controller/ai.controller");
const { authMiddleware } = require("../../../common/middlewares/auth.middleware");
const upload = require("../../../common/utils/fileUpload");
const { ValidationError } = require("../../../common/errors/AppError");

// Helper middleware to inject workspace name into body for specific routes
const injectWorkspace = (workspaceName) => {
  return (req, res, next) => {
    req.body.workspace = workspaceName;
    next();
  };
};

// Apply auth middleware to all AI routes
router.use(authMiddleware);

// --- File Upload for PDF Chat / RAG ---
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    throw new ValidationError("No file uploaded.");
  }
  return res.success("File uploaded successfully.", {
    name: req.file.originalname,
    path: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    fileType: path.extname(req.file.originalname).toLowerCase(),
  });
});

// --- AI Action Endpoints ---
router.post("/chat", injectWorkspace("chat"), aiController.generateResponse);
router.post("/literature-review", injectWorkspace("literature-review"), aiController.generateResponse);
router.post("/research-assistant", injectWorkspace("research-assistant"), aiController.generateResponse);
router.post("/paper-summary", injectWorkspace("paper-summary"), aiController.generateResponse);
router.post("/citation-generator", injectWorkspace("citation-generator"), aiController.generateResponse);
router.post("/research-gap", injectWorkspace("research-gap"), aiController.generateResponse);
router.post("/methodology", injectWorkspace("methodology-generator"), aiController.generateResponse);
router.post("/paper-review", injectWorkspace("paper-reviewer"), aiController.generateResponse);
router.post("/reviewer", injectWorkspace("paper-reviewer"), aiController.generateResponse);
router.post("/proposal", injectWorkspace("proposal-generator"), aiController.generateResponse);
router.post("/thesis", injectWorkspace("thesis-assistant"), aiController.generateResponse);
router.post("/pdf-chat", injectWorkspace("pdf-chat"), aiController.generateResponse);
router.post("/dataset", injectWorkspace("dataset-finder"), aiController.generateResponse);
router.post("/journal", injectWorkspace("journal-recommendation"), aiController.generateResponse);
router.post("/conference", injectWorkspace("conference-recommendation"), aiController.generateResponse);

// --- AI Meta / Config Endpoints ---
router.get("/templates", aiController.getTemplates);
router.get("/history", aiController.getHistory);

// --- AI Session History Endpoints ---
router.get("/sessions", aiController.getUserSessions);
router.post("/sessions", aiController.createSession);
router.get("/sessions/:id", aiController.getSessionById);
router.patch("/sessions/:id", aiController.updateSession);
router.delete("/sessions/:id", aiController.deleteSession);

module.exports = router;
