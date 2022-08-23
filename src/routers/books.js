const express = require('express')
const router = express.Router()
const db = require("../../db");


const selectQuery = {
    type: "SELECT *  FROM books WHERE type = $1",
    topic: "SELECT *  FROM books WHERE topic = $1",
    both: "SELECT *  FROM books WHERE type = $1 AND topic =$2"
}
const updateQuery = (queries) => {
    const keys = Object.keys(queries);
    let update = "";
    const params = [];
    const length = keys.length;
    for (let i = 0; i < length; i++) {
        update += ` ${keys[i]} = $${i + 1}`;
        if (i !== length - 1) update += ",";
        params.push(queries[keys[i]]);
    }
    return { update, params };
}

router.get("", async (req, res) => {
    let query = "SELECT * FROM books ";
    const params = [];//need to name params!!
    const keys = Object.keys(req.query);

    if (keys.length === 1) {
        query = selectQuery[keys[0]];
        params.push(req.query[keys[0]])
    } else if (keys.length > 1) {
        query = selectQuery.both;
        params.push(req.query[keys[0]], req.query[keys[1]]);
    }

    const queryResult = await db.query(query, params);
    console.log(queryResult);
    res.status(200).json({ books: queryResult.rows });
})
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    let query = "SELECT *  FROM books WHERE id = $1";
    const params = [id];
    const queryResult = await db.query(query, params);
    res.status(200).json({ book: queryResult.rows });
})
router.post("", async (req, res) => {
    const { title, type, author, topic, publicationDate, pages } = req.body;
    if (!title || !type || !author || !topic || !publicationDate || pages===undefined|null) {
        return res.status(400).json({
            error: "Missing fields in request body,Cannot be null"
        })
    }
    const query =
        `INSERT INTO books(title,type,author,topic,publicationDate,pages)
        SELECT '${title}','${type}','${author}','${topic}','${publicationDate}',${pages}
    WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = '${title}') RETURNING *;`
    const queryResult = await db.query(query);

    if (!queryResult.rows.length) {
        return res.status(409).json({ eror: 'Title provided already exists' });
    }

    res.status(201).json({ book: queryResult.rows })

});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { update, params } = updateQuery(req.body);
    const query = `UPDATE books SET ${update} WHERE books.id = ${id}  RETURNING *;`;
    const queryResult = await db.query(query, params);
    if (!queryResult.rows.length) return res.status(404).json({ eror: 'id provided doest not exists' });
    res.status(201).json({ book: queryResult.rows });

})
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM books WHERE books.id = ${id} RETURNING *;`;
    const queryResult = await db.query(query);
    if (!queryResult.rows.length) return res.status(404).json({ eror: 'id provided doest not exists' });
    res.status(201).json({ book: queryResult.rows });

})
module.exports = router
