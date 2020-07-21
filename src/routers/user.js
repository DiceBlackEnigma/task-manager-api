const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

const router = new express.Router();

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token );
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();Ø
//         }
//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
// });

router.patch('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        let user = req.user;

        const keys = Object.keys(req.body);
        keys.forEach( prop => user[prop] = req.body[prop]);
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) {
        //     return res.status(404).send();
        // }
        await req.user.remove();
        sendCancellationEmail(req.user);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/users',  async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (/.(png|jp(e)?g)$/.test(file.originalname)) {
            return cb(undefined, true);
        }
        cb( new Error('Please upload a file with the correct format') );
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250})
        .png()
        .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err}.message);
});

router.delete('/users/me/avatar', auth, async (req, res) => {
   req.user.avatar = undefined;
   await req.user.save();
   res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});


module.exports = router;
