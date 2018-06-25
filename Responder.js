const FormDao = require('./FormDao');

module.exports = class Responder {

    constructor() {
        this.formDao = new FormDao('test', null);
    }

    respond(req) {
        if(this.isValid(req)) {
            return this.handleContext(req.body.queryResult.outputContexts);
        }
    }

    isValid(req) {
        if (req.hasOwnProperty('body')
            && req.body.hasOwnProperty('queryResult')
            && req.body.queryResult.hasOwnProperty('outputContexts')) {
                return true;
            }
        
        return false;
    }

    getContextName(context) {
        if(context === undefined) {
            return false;
        }
        let arr = context.name.split('/');
        let l = arr.length;
        let contexts = arr[l - 2];
        let name = arr[l - 1];
        if (contexts === 'contexts') return name;
        console.log("Shit's broke.");
        return false;
    }
    
    getRelevantContext(contexts) {
        let validContextNames = ['info', 'estimateinfo', 'loaninfo'];
        let validContext = contexts.find((context, i) => {
            return validContextNames.includes(this.getContextName(context));
        });
        return validContext !== [] ? validContext : false; 
    }

    handleContext(contexts) {
        let context = this.getRelevantContext(contexts);
        if (context === false) {
            return;
        }

        
        switch(this.getContextName(context)) {
            case 'info':
                return this.handleInfo(context.parameters);
                break;
            case 'loaninfo':
                return this.handleLoanInfo(context.parameters);
                break;
        }
    }


    handleLoanInfo(p) {
        let loan = p.LoanType === 'Auto Loan' ? `an ${p.LoanType}` : `a ${p.LoanType}`; 
        console.log(p);
        let text = `We can approve you for ${loan} of up to $${p.creditScore * 35}! Would you like to learn about the offers approved for you?`;
        return this.jsonTextResponse(text);
    }

    handleInfo(p) {
        if(p.hasOwnProperty('email')) {
            p.email = this.formatEmail(p.email);
        }
        this.formDao.insertFormSub(p.first, p.last, null, p.email, p.address, p.zip);
        
        let text = `You can go to ${btnLink} to get more information about your specialized loan.`;
        let title = p.first ? `Click me, ${p.first}!` : `Click me!`;
        let subtitle = 'Click here to see exclusive offers!';
        let imgUrl = 'http://www.pebble.tv/wp-content/uploads/2014/04/dolphin.jpg';
        let btnText = 'Click here.';
        let btnLink = 'www.google.com';
        return this.jsonCardResponse(text, title, subtitle, imgUrl, btnText, btnLink);
    }

    formatEmail(email) {
        return email.toLowerCase().replace(/ at /, '@').replace(/\s/g, '');
    }
    
    prePopLink(b) {
        let link = 'www.prepoppage.com/';
        let isFirst = true;
        for(let prop in b) {
            let char = isFirst ? '?' : '&';
            if(b[prop] && !prop.endsWith('original')) {
                link += char + prop + '=' + b[prop]; 
            }
            isFirst = false;
        }
        return encodeURI(link);
    }

    jsonTextResponse(text) {
        return JSON.stringify({"fulfillmentText": text});
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