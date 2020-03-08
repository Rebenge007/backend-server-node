var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


// ================================================================
//  Obtener elementos
// ================================================================
app.put('/:tipo/:id', (req, res, next) => {
    // obtener parametros de la url
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        })
    }
    // validar si se recibio un archvio
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No files were uploaded.',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }
    // Obtener el nombre del archivo
    var archivo = req.files.image;
    var splitName = archivo.name.split('.');
    var extensionArchivo = splitName[splitName.length - 1]
        // var extensionArchivo = splitName.pop();

    // extenciones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    // valida las extenciones aceptadas
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extención no valida',
            errors: { message: 'Las extenciones validas son: ' + extensionesValidas.join(', ') }
        });
    }
    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // mover el archivo de un temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archvio',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo == 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                })
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                // elimina la imagen existente
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del usuario',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada !!!',
                    usuario: usuarioActualizado
                });
            });
        });

    }
    if (tipo == 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no existe' }
                })
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del medico',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada !!!',
                    medico: medicoActualizado
                });
            });
        });

    }
    if (tipo == 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }
                })
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del hospital',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada !!!',
                    hospital: hospitalActualizado
                });
            });
        });

    }
}

module.exports = app;