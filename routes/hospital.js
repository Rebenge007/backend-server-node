var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ================================================================
//  Ontener todos los Hospitales Inicio
// ================================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            }
        );
});
// ================================================================
//  Ontener todos los Hospitales Fin
// ================================================================

// ================================================================
//  Actualizar Hospital Inicio
// ================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital seleccionado',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'No existe ',
                errors: 'No existe un hospital con ese id'
            })
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });
});
// ================================================================
//  Actualizar Hospital Fin
// ================================================================

// ================================================================
//  Crear Hospital Inicio
// ================================================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});
// ================================================================
//  Crear Hospital Fin
// ================================================================

// ================================================================
//  Eliminar Hospital Inicio
// ================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital'
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe ningun hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});
// ================================================================
//  Eliminar Hospital Fin
// ================================================================

module.exports = app;