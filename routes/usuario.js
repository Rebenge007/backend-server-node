/* 
    Rutas  
    Require req
    Response res respuesta enviada a quien haga la solicitud
    next cuando se ejecute indica seguir conla instruccion siguiente
*/
/**
 * importar la libreria express
 */
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

/**
 * levantar la app
 */
var app = express();

/**
 * permite utilizar la coleccion seleccionada
 */
var Usuario = require('../models/usuario');

// ================================================================
// Obtener Todos los Usuarios
// ================================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    /**
     * err: error generado por mongo,
     * usuarios: coleccion que trae la informacion que coincide con el query
     * buscara todos los registros unicamente con los campos indicados
     */
    Usuario.find({}, 'nombre apPaterno email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            }
        );
});

// ================================================================
// Actualizar usuario
// ================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario seleccionado',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'No existe ',
                errors: 'No existe un usuario con ese id'
            })
        }
        usuario.nombre = body.nombre;
        usuario.apPaterno = body.apPaterno;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ' ::: ';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
        // res.status(200).json({
        //     ok: true,
        //     id: id
        // });
    });
})

// ================================================================
// Crear un nuevo usuario
// ================================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // se obtiene la inforacion
    var body = req.body;
    // se crea el objeto inicializando valores
    var usuario = new Usuario({
        nombre: body.nombre,
        apPaterno: body.apPaterno,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // es necesario encriptar la contraseña antes de ser enviada
        img: body.img,
        role: body.role
    });
    // se almacena en la base de datos si no hay errores
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ================================================================
// Borrar un usuario por ID
// ================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario'
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe ningun usuario con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

/**
 * indica que se puede exportar fuera de este archivo
 * para utilizar las funciones que se generen en este archivo desde otra ubicación
 */
module.exports = app;