var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
// ================================================================
// Verificar Token
// ================================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido o incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
        // res.status(200).json({
        //     decoded: decoded
        // })
    });
}

// ================================================================
// Verificar Admin
// ================================================================
exports.verificaADMIN_ROLE = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no valido role invalido',
            errors: { message: 'ROLE INVALIDO, permisos insuficientes' }
        });
    }
}

// ================================================================
// Verificar Admin o mismo usuario
// ================================================================
exports.verificaAdmin_o_MismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no valido, role invalido, usuario no es el mismo',
            errors: { message: 'ROLE INVALIDO, permisos insuficientes, usuario no es el mismo' }
        });
    }
}