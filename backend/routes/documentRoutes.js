const express = require("express");
const router = express.Router();
const { uploadDocument, getMyDocuments, getAllDocuments, updateDocumentStatus } = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/upload", uploadDocument);
router.get("/my-documents", getMyDocuments);

// HR only
router.get("/", authorize("master_hr"), getAllDocuments);
router.put("/:id/status", authorize("master_hr"), updateDocumentStatus);

module.exports = router;
