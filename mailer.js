var nodemailer = require('nodemailer');
var auth = require('./auth.js');

function sendMail(SYMBOL, date){
    var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: auth.gmail_u,
        pass: auth.gmail_p
    }
    });
    var mailOptions = {
        to: auth.target_email,
        from: 'do-not-reply@stockpiler.com',
        subject: 'StockPiler Evaluations for '+date,
        text: 'This is an email from your stockpiler app.\n\n' +
            'For today ['+ date +']. The app has found the following interesting movesets amongst the stocks it tracks:\n\n' +
            ''
    };
    transporter.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + auth.target_email + ' with a list of stock evaluations.');
        done(err, 'done');
    });
}

exports = module.exports = sendMail;