const express = require('express')
const router = express.Router()
const db = require("../../db");


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
    let query = "SELECT * FROM pets ";
    const params = [];//need to name params!!
     if(req.query.type){
        query = "SELECT *  FROM pets WHERE type = $1";
        params.push(req.query.type);
     }
    const queryResult = await db.query(query, params);
    console.log(queryResult);
    res.status(200).json({ pets: queryResult.rows });
})
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    let query = "SELECT *  FROM pets WHERE id = $1";
    const params = [id];
    const queryResult = await db.query(query, params);
    res.status(200).json({ book: queryResult.rows });
})
router.post("", async (req, res) => {
    const { name,age,type, breed, microchip } = req.body;
    console.log(req.body);
    if (!name || !type || !breed || microchip === undefined|| age === undefined ) {
        return res.status(400).json({
            error: "Missing fields in request body,Cannot be null"
        })
    }
    const query =
        `INSERT INTO pets(name, age, type, breed, microchip)
         VALUES ('${name}',${age},'${type}','${breed}',${microchip}) RETURNING *;`
    const queryResult = await db.query(query);
    res.status(201).json({ book: queryResult.rows })

});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { update, params } = updateQuery(req.body);
    const query = `UPDATE pets SET ${update} WHERE pets.id = ${id}  RETURNING *;`;
    const queryResult = await db.query(query, params);
    if (!queryResult.rows.length) return res.status(404).json({ eror: 'id provided doest not exists' });
    res.status(201).json({ book: queryResult.rows });

})
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM pets WHERE pets.id = ${id} RETURNING *;`;
    const queryResult = await db.query(query);
    if (!queryResult.rows.length) return res.status(404).json({ eror: 'id provided doest not exists' });
    res.status(201).json({ book: queryResult.rows });

})
module.exports = router
