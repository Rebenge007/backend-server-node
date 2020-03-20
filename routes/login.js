var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// ================================================================
// Google
// ================================================================ 
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================================================
// Autenticación De Google
// ================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // mantiene la informacion de lusuario
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req, res) => {
    var token = req.body.token;
    // para usar el await es obligatorio que se ejecute dentro de una funcion async
    var googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            mensjae: 'Token no válido',
            err: e
        })
    });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensjae: 'Error al buscar el usuario',
                errors: err
            })
        }
        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                })
            } else {
                // usuario.password = ':::!!!:::';
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 hrs

                res.status(200).json({
                    ok: true,
                    mensaje: 'login google backend',
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            }
        } else { // el usuario no existe es necesario crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.apPaterno = googleUser.apPaterno ? googleUser.apPaterno : '...';
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':::!!!:::';

            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al crear usuario - google',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 hrs

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });
    // return res.status(200).json({
    //     ok: true,
    //     mensjae: 'Servicio Post de autenticación Google correcto',
    //     googleUser: googleUser
    // });
});

// ================================================================
//  Autenticación Normal
// ================================================================
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        console.log(' ..: ', usuarioBD);
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario para login',
                errors: err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error con las credenciales del email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas password',
                errors: err
            });
        }

        // crerar un token !!!
        // el secret es el seed
        // paramas payload, seed, fecha de expiracion
        usuarioBD.password = ' ::: ';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 hrs

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            msg: 'autenticacion nomal correcta'
        });
    });
});

module.exports = app;