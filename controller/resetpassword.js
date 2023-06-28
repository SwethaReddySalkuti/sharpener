const uuid = require('uuid');
//const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const {createTransport} = require('nodemailer');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

const transporter = createTransport({
    host:"smtp-relay.sendinblue.com",
    port:587,
    auth : {
        user : "salkutiswethareddy@gmail.com",
        pass : "xsmtpsib-277812e098f86ecddde4335821812cb4c9dae3b89ba110cd8835488a48af0e9e-Uqsv7XTtnk5VFBfg"
    }
});


const forgotpassword = async (req, res) => {
    try {
        const { email } =  req.body;
        const user = await User.findOne({where : { email }});
        console.log(user);
        if(user)
        {
            const id = uuid.v4();
            user.createForgotpassword({ id , active: true })
                .catch(err => {
                    throw new Error(err)
                })

            

            const msg = {
                to: email, // Change to your recipient
                from: 'salkutiswethareddy@gmail.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
            }

            transporter
            .sendMail(msg, function(err,response)
            {
                if(err)
                {
                    console.log(err)
                }
                else
                {
                    return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', sucess: true})
                }
  
                

            })

            //send mail
        }
        else 
        {
            throw new Error('User doesnt exist')
        }
    } catch(err){
        console.error(err)
        return res.json({ message: err, sucess: false });
    }

}

const resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ active: false});
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()

        }
    })
}

const updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                // console.log('userDetails', user)
                if(user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}
/*//bulkSend.js
var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = 'YOUR_API_KEY';

new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({

     "sender":{ "email":"sendinblue@sendinblue.com", "name":"Sendinblue"},
     "subject":"This is my default subject line",
     "templateId":27,
     "params":{
        "greeting":"This is the default greeting",
        "headline":"This is the default headline"
     },
     "messageVersions":[
       //Definition for Message Version 1 
       {
           "to":[
              {
                 "email":"bob@example.com",
                 "name":"Bob Anderson"
              },
              {
                 "email":"anne@example.com",
                 "name":"Anne Smith"
              }
           ],
           "params":{
              "greeting":"Hello again!",
              "headline":"Take advantage of our summer deals, taylored just for you"
           },
           "subject":"Some deals worth to be looked at!"
        },

        //Definition for Message Version 2 
        {
            "to":[
               {
                  "email":"marie@example.com",
                  "name":"Marie Delvaux"
               }
            ],
            "params":{
               "greeting":"Hello Marie, we have prepared some exclusive summer deals for you.",
               "headline":"Some bathing suits you might like"
            },
            "subject":"Marie, new bathing suits are here."
         }
    ]

}).then(function(data) {
  console.log(data);
}, function(error) {
  console.error(error);
});

//project_directory/emailBuilder.js

var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = 'YOUR_API_KEY';

new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
  {
    'subject':'Hello from the Node SDK!',
    'sender' : {'email':'api@sendinblue.com', 'name':'Sendinblue'},
    'replyTo' : {'email':'api@sendinblue.com', 'name':'Sendinblue'},
    'to' : [{'name': 'John Doe', 'email':'example@example.com'}],
    'htmlContent' : '<html><body><h1>This is a transactional email {{params.bodyMessage}}</h1></body></html>',
    'params' : {'bodyMessage':'Made just for you!'}
  }
).then(function(data) {
  console.log(data);
}, function(error) {
  console.error(error);
});


*/ 


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}