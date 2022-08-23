const express = require('express')
const router = express.Router()
const db = require("../../db");

router.get("", async (req, res) => {
    let query = "SELECT * FROM pets ";
    //const params = [];
    const queryResult = await db.query(query);
    res.status(200).json({pets: queryResult.rows});
})

module.exports = router