const router = require("express").Router();
const adminController = require("../controllers/admin");
const { tokenVerifier } = require("../middlewares/tokenVerifier");

// getting artists lists

router.get("/fetch/pending/requests", adminController.fetchPendingRequests);

router.get("/fetch/approved/requests", adminController.fetchApproved);

router.get("/fetch/rejected/requests", adminController.fetchRejected);

// getting users list

router.get("/fetch/all", adminController.fetchAllUsers);

router.get("/fetch/active", adminController.fetchActiveUsers);

router.get("/fetch/inactive", adminController.fetchInactiveUsers);

// make user/artist active or inactive

router.patch(
  "/make/active/inactive/:userId",
  adminController.makeInactiveOrActive
);

router.get("/detail/:userId", adminController.getDetail);

router.get("/fetch/nfts/all", adminController.fetchAllNfts);

router.post("/create/admin", adminController.createAdmin);

router.patch(
  "/update/admin/:adminId",
  tokenVerifier,
  adminController.updateAdmin
);

module.exports = router;
