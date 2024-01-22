// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const sgMail = require('@sendgrid/mail'); 

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);



//  exports.signup = (req, res) => {
//     //console.log('REQ BODY ON SIGNUP', req.body);
//     const {firstname, email, password} = req.body

//     User.findOne({ email })
//     .then(user => {
//         if (user) {
//             return res.status(400).json({
//                 error: 'We are sorry, Email is taken. Kindly signup using another email'
//             });
//         }
//     })
//     .catch(err => {
//         // Handle any errors that occurred during the query
//         // For example, you might log the error or send a 500 response
//         console.error(err);
//         res.status(500).json({
//             error: 'Internal Server Error'
//         });
//     });

//     let newUser = new User({firstname, email, password})

//     newUser.save()
//     .then(success => {
//         res.json({
//             message: 'Thank you for registering as a member of TCN Lekki. At The Covenant Nation, you never walk alone.'
//         });
//     })
//     .catch(err => {
//         console.log('SIGNUP ERROR', err);
//         res.status(400).json({
//             error: err
//         });
//     });
// };

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

exports.signup = async (req, res) => {
    try {
        const {name, email, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, password} = req.body;

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                error: 'We are sorry, Email is taken. Kindly signup using another email'
            });
        }

        const token = jwt.sign({ name, email, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            From: process.env.EMAIL_FROM,
            To: email,
            Subject: 'Account Activation Link',
            HtmlBody: `
                <h1>Please use the following link to activate your account.</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
        };

        const sent = await client.sendEmail(emailData);

        return res.json({
            message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
        });
    } catch (err) {
        console.error('SIGNUP ERROR', err);
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};

exports.accountActivation = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.json({
                message: 'Something went wrong, please try again.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

        const {name, email, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, password } = jwt.decode(token);

        const user = new User({ name, email, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, password });

        const savedUser = await user.save();

        res.json({
            message: 'Signup successful. You can sign in now.',
            user: savedUser,
        });
    } catch (error) {
        console.error('Account Activation Error:', error);

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                error: 'Sorry, the link has expired. Kindly signup again'
            });
        } else {
            res.status(401).json({
                error: 'Error during account activation. Try signup again.'
            });
        }
    }
};

// exports.accountActivation = (req, res) => {
//     const {token} = req.body

//     if(token) {
//         jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded){
//             if(err) {
//                 console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err)
//                 return res.status(401).json({
//                     error: 'Expired link. Kindly signup again'
//                 })
//             }
//             const {firstname, email, password} = jwt.decode(token);

//             const user = new User({firstname, email, password});

//             user.save((err, user) => {
//                if(err) {
//                 console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err)
//                 return res.status(401).json({
//                     error: 'Error saving user in database. Try signup again'
//                    });
//             } 
//                return res.json({
//                 message: 'Signup success. You can sign in now.'
//                })
//             } )
//         })
//     } else {return res.json({
//         message: 'Something went wrong, please try again.'
//        })}
// };

/**
 * Check if user is trying to signin but have not signup yet
 * Check if password match with hashed_password that is saved in db
 * If yes, generate token with expiry
 * The token will be sent to client/react
 * It will be used as jwt based authentication system
 * We can allow user to access protected routes later if they have valid token
 * so jwt token is like password with expiry date
 * For successful signin we will send user info and valid token
 * This token will be sent back to the server from client/react to access protected routes subsequently
 */

// Method to signin user

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // To check if user exists
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(400).json({
                error: 'User with that email does not exist, please sign up'
            });
        }

        // To authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            });
        }

        // To generate a token and send to user client/user
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const {_id, name, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, role} = user;

        return res.json({
            token,
            user: { _id,name, email, phoneNumber, birthDay, ageGroup, occupation, gender, maritalStatus, role }
        });
    } catch (err) {
        console.error('SIGNIN ERROR', err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};





//  User.findOne({email}).exec((err, user) => {
//     if(err || !user) {
//         return res.status(400).json({
//             error: 'User with that email does not exist, please sign up '
//         })
//     }  
//     // To authenticate
//     if(!user.authenticate(password)) {
//         return res.status(400).json({
//             error: 'Email and password do not match'
//         })
//     }
//     // To generate a token and send to user client/user
//     const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
//     const {_id, firstname, email, role} = user

//     return res.json({
//         token,
//         user: {_id, firstname, email, role}
//     });
// })