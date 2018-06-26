module.exports = class Context {
    constructor(obj, parent) {
        const isValid = obj.hasOwnProperty('name');
        if(!isValid) throw new Error('Context is invalid.');
        this.parent = parent;
        this.context = obj;
    }

    getName() {
        return this.context.name.split('/').pop();
    }

    getParams() {
        if (!this.context.hasOwnProperty('parameters')) return false;
        let params = {};
        for(let prop in this.context.parameters) {
            if(!prop.includes('.original')) {
                params[prop] = this.context.parameters[prop];
            }
        }
        return params;
    }

    getParent() {
        return this.parent;
    }

    getSession() {
        return this.getParent().getSession();
    }

    getIp () {
        return this.getParent().getIp();
    }
}