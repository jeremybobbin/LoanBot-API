const Context = require('./Context');

module.exports = class Request {
    constructor(req) {
        const isValid = (
            req.body.hasOwnProperty('session')
            && req.body.hasOwnProperty('queryResult')
            && req.body.queryResult.hasOwnProperty('outputContexts')
        );
        if(!isValid) throw new Error('LoanBot Request is not valid.');
        this.obj = req.body;
        
        this.contexts = [];
        this.obj.queryResult.outputContexts.forEach(context => this.contexts.push(new Context(context, this)));
        this.obj.ip = req.ip;
        this.obj.ips = req.ips;
    }

    getContextByName(name) {
        const validContext = this.getContexts().find((context, i) => name === context.getName());
        return validContext ? validContext : false; 
    }

    getContextByNames(names) {
        for(let name of names) {
            let context = this.getContextByName(name);
            if (context !== false) return context;
        }
        return false;
    }

    getContexts() {
        return this.contexts;
    }

    getSession() {
        return this.obj.session.split('/').pop();
    }

    getIp() {
        return this.obj.ip;
    }
}