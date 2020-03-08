var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ================================================================
//  Ontener todos los Medicos Inicio
// ================================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médico',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        totoal: conteo
                    });
                });
            }
        );
});
// ================================================================
//  Ontener todos los Medicos Fin
// ================================================================

// ================================================================
//  Actualizar Hospital Inicio
// ================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el medico seleccionado',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'No existe ',
                errors: 'No existe un medico con ese id'
            })
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });
});
// ================================================================
//  Actualizar Médico Fin
// ================================================================

// ================================================================
//  Crear Médico Inicio
// ================================================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});
// ================================================================
//  Crear Médico Fin
// ================================================================

// ================================================================
//  Eliminar Médico Inicio
// ================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico'
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe ningun medico con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});
// ================================================================
//  Eliminar Médico Fin
// ================================================================

module.exports = app;