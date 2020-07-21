const db = require("../config/database");

// // Used for login purposes
// async function findUserWithId(id) {
//     const result = await findUserWithIdPromise(id);
//     return result;
// }

// function findUserWithIdPromise(id) {
//     return new Promise((resolve, reject) => {
//         db.query("SELECT * FROM user WHERE user_id = ?", id,
//             (err, results, fields) => {
//                 return err ? reject(err) : resolve(results[0]);
//             });
//     })
// };

module.exports = {
    findUserWithId : async (id) => {
        const result = await findUserWithIdPromise(id);
        return result;
    },

    findUserWithIdPromise : async (id) => {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM user WHERE user_id = ?", id,
                (err, results, fields) => {
                    return err ? reject(err) : resolve(results[0]);
                });
        })
    }
}