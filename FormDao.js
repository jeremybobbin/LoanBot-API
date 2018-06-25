let mysql = require('mysql');

module.exports = class formDao {

    constructor(database = 'loanAction', socketPath = '/cloudsql/jer-test-207918:us-central1:jer', user = 'root', password = 'pass') {
        this.conn = mysql.createConnection({
            socketPath,
            user,
            password,
            database
        });

        this.conn.connect();
        this.init();
    }

    init() {
        this.query(
            `CREATE TABLE IF NOT EXISTS formSubmits (\
                id int NOT NULL AUTO_INCREMENT PRIMARY KEY, \
                first varchar(255), \
                last varchar(255), \
                email varchar(255), \
                creditScore int, \
                zip varchar(255), \
                address varchar(255) \
            );`
        )
        .catch(console.log);
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, res) =>{
                err ? reject(err) : resolve(res);
            });
        });
    }

    insertFormSub(first, last, creditScore, email, address, zip) {
        let sql = `INSERT INTO formSubmits (first, last, creditScore, email, zip, address) VALUES \
        ('${first}', '${last}', ${creditScore}, '${email}', '${zip}', '${address}')`
        return this.query(sql);
    }

}