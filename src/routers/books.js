const express = require('express')
const router = express.Router()
const db = require("../../db");
const book = {
    title: "",
    type: "",
    author: "",
    topic: "",
    publicationDate: "",
    pages: ""
}

const getMappedQueryByJoin = (queries, joined) => {
    const keys = Object.keys(queries);
    const mappedCols = keys.map((col, index) => {
        return `${col} = $${index + 1}`
    }
    )
    const query = mappedCols.join(`${joined}`);
    return query;
}
const queryClause = (sql, queries) => {
    if (!Object.keys(queries).length === 0) return sql;
    const query = getMappedQueryByJoin(queries, " AND ");

    return `${sql} WHERE ${query}`;
}
const insertClause = (sql, insert, clause) => {

    const columnNames = Object.keys(insert).join(",");
    const values = Object.values(insert).map(value => `'${value}'`).join(",");
    return `${sql}(${columnNames}) SELECT ${values} WHERE NOT EXISTS (${clause}) RETURNING *;`;

}
const deleteClause = (sql, clauses) => {
    return `${sql} WHERE ${clauses} RETURNING *;`;
}
const updateClause = (sql, queries, clauses) => {
    const setQuery = getMappedQueryByJoin(queries, ",");

    return `${sql} SET ${setQuery} WHERE ${clauses} RETURNING *`

}
const checkNullRequest = (request, res) => {
    const reqArray = Object.values(request);
    //let result = result1.filter(o1 => result2.some(o2 => o1.id === o2.id));
    const notNullList = Object.keys(book);
    const isEqual = Object.keys(request).every((key, index) => key === notNullList[index]);
    //console.log(isEqual);
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
    const query = queryClause("SELECT * FROM books ", req.query);
    const queryResult = await db.query(query, Object.values(req.query));
    console.log(queryResult);
    res.status(200).json({ books: queryResult.rows });
})
router.get("/:id", async (req, res) => {
    const query = "SELECT *  FROM books WHERE id = $1";
    const queryResult = await db.query(query, Object.values(req.params));
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(200).json({ book: queryResult.rows });
})
router.post("", async (req, res) => {
    const isNull = checkNullRequest(req.body, res);
    if (isNull) return isNull;
    //const insertClause = (sql,insert, clause) =
    const query = insertClause("INSERT INTO books", req.body, `SELECT 1 FROM books WHERE title = '${req.body.title}'`)
    /* const query =
         `INSERT INTO books(title,type,author,topic,publicationDate,pages)
         SELECT '${title}','${type}','${author}','${topic}','${publicationDate}',${pages}
     WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = '${title}') RETURNING *;`
     */
    const queryResult = await db.query(query);
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows })

});
router.patch("/:id", async (req, res) => {
    const query = updateClause("UPDATE books", req.body, `id = ${req.params.id}`);
    console.log({query});
    //const query = `UPDATE books SET ${update} WHERE books.id = ${id}  RETURNING *;`;
    const queryResult = await db.query(query, Object.values(req.body));
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows });

})
router.delete("/:id", async (req, res) => {

    const query = deleteClause("DELETE FROM books", `id = ${req.params.id}`);
    //const query = `DELETE FROM books WHERE books.id = ${id} RETURNING *;`;
    const queryResult = await db.query(query);
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ book: queryResult.rows });

})
module.exports = router
