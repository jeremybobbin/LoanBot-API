let mysql = require('mysql');

module.exports = class formDao {

    constructor(database = 'loanAction', socketPath = 'Insert Path Here', user = 'root', password = 'pass') {
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
            `CREATE TABLE IF NOT EXISTS sessions ( \
            id varchar(255) NOT NULL, \
            ip varchar(255), \
            first varchar(255), \
            last varchar(255), \
            email varchar(255), \
            address varchar(255), \
            zip varchar(255), \
            creditScore int, \
            income int, \
            loanType varchar(255), \
            downPayment int, \
            term int \
        )`).catch(console.log);
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, res) =>{
                err ? reject(err) : resolve(res);
            });
        });
    }

    insertSession(sessId, ip, first, last, email, address, zip, creditScore, income, loanType, downPayment, term) {
        let sql = `INSERT INTO sessions (id, ip, first, last, email, address, zip, \
             creditScore, income, loanType, downPayment, term) VALUES \
            ('${sessId}', '${ip}', '${first}', '${last}', '${email}', '${address}', '${zip}', \
            ${creditScore}, ${income}, '${loanType}', ${downPayment}, ${term})`;
        
        sql = this.parseSql(sql);
        console.log(sql);
        return this.query(sql);
    }

    updateSession(sessId = null, ip = null, first = null, last = null, email = null,
        address = null, zip = null, creditScore = null, income = null,
        loanType = null, downPayment = null, term = null) {
        
        const columns = [
            'id',
            'ip',
            'first',
            'last',
            'email',
            'address',
            'zip',
            'creditScore',
            'income',
            'loanType',
            'downPayment',
            'term'
        ];
        const ints = ['zip', 'creditScore', 'income', 'downPayment', 'term'];
        const argValues = Array.from(arguments);
        let arr = [];

        argValues.forEach((value, i) => {
            if (value !== null && columns[i] !== 'id') {
                let string = columns[i] + ' = ';
                string += ints.includes(columns[i]) ? value : "'" + value + "'";
                arr.push(string);
            }
        });
        let sql = `UPDATE sessions SET ${arr.join(', ')} WHERE id = '${sessId}';`;
        sql = this.parseSql(sql);
        console.log(sql);
        return this.query(sql);
    }

    sessionExists(sessId) {
        return this.query(`SELECT id FROM sessions WHERE id = '${sessId}'`)
            .then(result => result.length !== 0);
    }

    parseSql(sql) {
        return sql.replace(/'null'/gmi, 'NULL');
    }

    putSession(sessId, ip = null, first = null, last = null, email = null,
        address = null, zip = null, creditScore = null, income = null,
        loanType = null, downPayment = null, term = null) {

        if(!sessId) throw Error('Session ID is not defined -Jer');
        return this.sessionExists(sessId)
            .then(result => {
                result ? 
                this.updateSession(sessId, ip, first, last, email, address, zip, creditScore, income, loanType, downPayment, term)
                :
                this.insertSession(sessId, ip, first, last, email, address, zip, creditScore, income, loanType, downPayment, term);
            });

    }

}