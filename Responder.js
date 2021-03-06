const config = require('./config');
const Request = require('./Request');

module.exports = class Responder {

    constructor(dao) {
        this.formDao = dao;
    }

    respond(req) {
        return new Promise(resolve => {
            resolve(this.handleRequest(new Request(req)));
        });
    }

    handleRequest(request) {
        let context = request.getContextByNames(['info', 'loaninfo', 'init']);
        if (context) {
            switch(context.getName()) {
                case 'info':
                    return this.handleInfo(context);
                    break;
                case 'loaninfo':
                    return this.handleLoanInfo(context);
                    break;
                case 'init': 
                    return this.handleInit(context);
                    break;
            }
        }
    }

    handleLoanInfo(context) {
        const p = context.getParams();
        const sessId = context.getSession();
        const ip = context.getIp();

        let loan = p.LoanType === 'Auto Loan' ? `an ${p.LoanType}` : `a ${p.LoanType}`; 
        this.formDao.putSession(sessId, ip, null, null, null, null, null, p.creditScore,
            p.income.amount, p.LoanType, p.moneyDown.amount, this.formatTerm(p.term));
        
        let text = `We can approve you for ${loan} of up to $${p.creditScore * 35}! Would you like to learn about the offers approved for you?`;
        return this.jsonTextResponse(text);
    }

    handleInfo(context) {
        const sessId = context.getSession();
        const ip = context.getIp();
        const p = context.getParams();
        if(p.hasOwnProperty('email')) {
            p.email = this.formatEmail(p.email);
        }
        
        this.formDao.putSession(sessId, ip, p.first, p.last, p.email, p.address, p.zip);

        let link = this.prePopLink(p);

        let text = `You can go to ${link} to get more information about your specialized loan.`;
        let title = p.first ? `Click me, ${p.first}!` : `Click me!`;
        let subtitle = 'Click here to see exclusive offers!';
        let imgUrl = 'http://www.pebble.tv/wp-content/uploads/2014/04/dolphin.jpg';
        let btnText = 'Click here.';
        let btnLink = link;
        return this.jsonCardResponse(text, title, subtitle, imgUrl, btnText, btnLink);
    }

    handleInit(context) {
        const ip = context.getIp();
        return this.formDao.getSessionByIp(ip)
            .then(results => {
                return this.jsonFollowup('Dang', 'jer_event');
            });
    }

    formatEmail(email) {
        return email.toLowerCase().replace(/ at /, '@').replace(/\s/g, '');
    }

    formatTerm(term) {
        if(term.unit = 'yr') return term.amount * 12;
        return term.amount;
    }
    
    prePopLink(b) {
        let link = config.prepop.base;
        let isFirst = true;
        for(let prop in b) {
            let char = isFirst ? '?' : '&';
            if(b[prop] && !prop.endsWith('original') && config.prepop.params[prop].enabled === true) {
                link += char + config.prepop.params[prop].key + '=' + b[prop]; 
            }
            isFirst = false;
        }
        return encodeURI(link);
    }

    jsonTextResponse(text) {
        return JSON.stringify({"fulfillmentText": text});
    }

    jsonFollowup(text, event) {
        return JSON.stringify({
            "fulfillmentText": text,
            "followupEventInput": {
                "name": event,
                "languageCode": "en-US",
                "parameters": {
                    "param": "param value"
                }
            }
        });
    }

    jsonCardResponse(fulfillmentText, title, subtitle, imgUrl, buttonText, buttonLink) {
        return JSON.stringify({
            "fulfillmentText": fulfillmentText,
            "fulfillmentMessages": [
                {
                    "card": {
                        "title": title,
                        "subtitle": subtitle,
                        "imageUri": imgUrl,
                        "buttons": [
                            {
                                "text": buttonText,
                                "postback": buttonLink
                            }
                        ]
                    }
                }
            ]
        })
    }
}