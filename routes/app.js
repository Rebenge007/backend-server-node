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

/**
 * levantar la app
 */
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'peticion realizaca correctamente'
    });
});

/**
 * indica que se puede exportar fuera de este archivo
 * para utilizar las funciones que se generen en este archivo desde otra ubicación
 */
module.exports = app;