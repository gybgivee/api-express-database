const express = require('express')
const router = express.Router()

const Query = require("../domain/utils-db.js");
const booksQuery = new Query("books");

const book = {
    title: "",
    type: "",
    author: "",
    topic: "",
    publicationDate: "",
    pages: 0
}

const checkNullRequest = (request, res, columns) => {
    const notNullList = Object.keys(columns);
    const isEqual = Object.keys(request).every((key, index) => key === notNullList[index]);
    if (!isEqual) {
        return res.status(400).json({
            error: "Missing fields in request body,Cannot be null"
        })
    }
    return;

}
const checkDBStatus = (db, res) => {
    if (!db.rows.length) {
        if (db.command === "INSERT") {
            return res.status(409).json({ eror: 'Title provided already exists' });
        }
        return res.status(404).json({ eror: 'id provided doest not exists' });
    }
}


router.get("", async (req, res) => {
    const queryResult = await booksQuery.getAll(req);
    res.status(200).json({ books: queryResult.rows });
})
router.get("/:id", async (req, res) => {
    const queryResult = await booksQuery.getById(req);

    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(200).json({ book: queryResult.rows });
})
router.post("", async (req, res) => {
    const isNull = checkNullRequest(req.body, res, book);
    if (isNull) return isNull;

    const queryResult = await booksQuery.insertWithUnique(req, { unique: "title", value: req.body.title },book);
    
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows })

});
router.patch("/:id", async (req, res) => {
    const queryResult = await booksQuery.updateById(req);
    
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows });

})
router.delete("/:id", async (req, res) => {
    const queryResult = await booksQuery.deleteById(req);
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows });

})
module.exports = router
