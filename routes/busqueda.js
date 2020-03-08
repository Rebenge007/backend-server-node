// importat el servidor express
var express = require('express');

// inicializar el proyecto
var app = express();

// modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ================================================================
// Busqueda por coleccion
// ================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regexTabla = new RegExp(tabla, 'i');
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla / coleccion no valido' }
            })
            break;
    }

    promesa.then(respuesta => {
        res.status(200).json({
            ok: true,
            [tabla]: respuesta
        });
    });
});

// ================================================================
//  Busqueda general
// ================================================================
app.get('/todo/:busqueda', (req, res, next) => {
    // se recupera el parametro buscado de la url
    var busqueda = req.params.busqueda;
    // valido el elemento buscado con una expresión regular
    var regex = new RegExp(busqueda, 'i');
    // se hace la busqueda por medio de un arreglo promesas
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});
// ================================================================
// 
// ================================================================
function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitakles', err)
                } else {
                    resolve(hospitales);
                }
            });
    });
}

// ================================================================
// 
// ================================================================
function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err)
                } else {
                    resolve(medicos);
                }
            });
    });
}

// ================================================================
// 
// ================================================================
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre apPaterno email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios')
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;