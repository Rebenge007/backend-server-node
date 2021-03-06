/*
    Requires
    importacion de librerias
    todo es case sesitive
*/
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

/* 
    inicializacion de variables 
    se crea la definicion del servidor express
*/
var app = express();

// ================================================================
// CORS
// ================================================================
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// body parser middleware es una función que se ejecutara siempre
// cuando una peticion entre siempre pasara por este codigo
// tomara la data y regresara un objeto js para ser utilizado donde sea necesario
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

/**
 * Server index config 
 * pruebas de funcionamiento
 */
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

/**
 * improtar Rutas
 */
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

/**
 * middleware
 * se ejecuta antes de la ejecución de otras rutas
 */
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

/*
    Conexion a la base de datos  
*/
mongoose.connect('mongodb://localhost:27017/hospitaldb', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('Base de datos mongodb: \x1b[32m%s\x1b[0m', ' online !!!');
});
// mongoose.connect.openUri('mongodb://localhost:21017/hospitaldb', (err, res) => {
//     if (err) throw err; // detiene el proceso 
//     console.log('Base de datos mongodb: \x1b[32m%s\x1b[0m', ' online !!!');
// });

// escuchar peticiones
/* 
    \x1b indica donde comienza y donde termina
    \x1b[32m%s\x1b[0m realiza el cambio de color a el parametro que este proximo 
    
        Colores para la consola
        Reset = "\x1b[0m"

        Bright = "\x1b[1m"

        Dim = "\x1b[2m"

        Underscore = "\x1b[4m"

        Blink = "\x1b[5m"

        Reverse = "\x1b[7m"

        Hidden = "\x1b[8m"

        FgBlack = "\x1b[30m"

        FgRed = "\x1b[31m"

        FgGreen = "\x1b[32m"

        FgYellow = "\x1b[33m"

        FgBlue = "\x1b[34m"

        FgMagenta = "\x1b[35m"

        FgCyan = "\x1b[36m"

        FgWhite = "\x1b[37m"

        BgBlack = "\x1b[40m"

        BgRed = "\x1b[41m"

        BgGreen = "\x1b[42m"

        BgYellow = "\x1b[43m"

        BgBlue = "\x1b[44m"

        BgMagenta = "\x1b[45m"

        BgCyan = "\x1b[46m"

        BgWhite = "\x1b[47m"

        Ejemplo:
        console.log('Node/Express: \x1b[36m%s\x1b[0m', 'online'); 
*/
app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', ' online !!!');
});