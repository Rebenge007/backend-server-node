var express = require('express');

var app = express();

// ayuda con la creacion del path para los elementos
const path = require('path');
const fs = require('fs');


// ================================================================
//  Obtener elementos
// ================================================================
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;
    // direccion completa para encontrar la imagen
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'peticion realizada correctamente'
    // });
});

module.exports = app;