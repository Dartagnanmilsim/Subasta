// ======================
// FIREBASE
// ======================

const firebaseConfig = {

apiKey:"AIzaSyB2CneyvJ35naCILtwFNUo3hhPRFM4tkyo",

authDomain:"subasta-pro.firebaseapp.com",

databaseURL:"https://subasta-pro-default-rtdb.firebaseio.com",

projectId:"subasta-pro",

storageBucket:"subasta-pro.firebasestorage.app",

messagingSenderId:"110324102442",

appId:"1:110324102442:web:055c40606660a2574b5a53"

};


firebase.initializeApp(firebaseConfig);

const db = firebase.database();



// ======================
// VARIABLES
// ======================


let usuarioActivo = null;

let subastaActual = "";

let datosSubasta = {};



// ======================
// CAMBIAR PANTALLA
// ======================


function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>p.style.display="none");


document.getElementById(id).style.display="block";

}





// ======================
// CREAR USUARIO
// ======================


function crearUsuario(){


let user = usuario.value
.trim()
.toLowerCase();



if(nombre.value.trim()=="" ||
user=="" ||
password.value==""){


alert("Completa todos los campos");

return;

}



if(!acepta.checked){

alert("Debes aceptar pagar si ganas");

return;

}



db.ref("usuarios/"+user)

.once("value", snap=>{


if(snap.exists()){

alert("Ese usuario ya existe");

return;

}



db.ref("usuarios/"+user)

.set({

nombre:nombre.value.trim(),

usuario:user,

clave:password.value,

fecha:new Date().toLocaleString()

})

.then(()=>{


alert("Usuario creado correctamente");


nombre.value="";

usuario.value="";

password.value="";

acepta.checked=false;


});


});


}






// ======================
// LOGIN USUARIO
// ======================


function entrarUsuario(){



let user = loginUser.value
.trim()
.toLowerCase();



db.ref("usuarios/"+user)

.once("value", snap=>{


if(!snap.exists()){


alert("Usuario no registrado");

return;

}



let datos = snap.val();



if(datos.clave != loginPass.value){


alert("Contraseña incorrecta");

return;

}



usuarioActivo = datos;


loginUser.value="";

loginPass.value="";


verSubastas();


});


}








// ======================
// ADMIN LOGIN
// ======================


function loginAdmin(){


if(clave.value!="1234"){

alert("Clave incorrecta");

return;

}


mostrar("admin");

cargarAdmin();


}







// ======================
// CREAR SUBASTA
// ======================


function crearSubasta(){


if(titulo.value=="" ||
base.value=="" ||
incremento.value==""){


alert("Completa datos de la subasta");

return;

}



let id="SUB_"+Date.now();



db.ref("subastas/"+id)

.set({

titulo:titulo.value,

imagen:imagen.value,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

estado:"ACTIVA",

fin:fin.value

})

.then(()=>{


alert("Subasta creada");


titulo.value="";
imagen.value="";
descripcion.value="";
base.value="";
incremento.value="";
fin.value="";


});


}









// ======================
// ADMIN
// ======================


function cargarAdmin(){


// USUARIOS


db.ref("usuarios")

.on("value", snap=>{


listaUsuarios.innerHTML="";


let contador=0;



snap.forEach(x=>{


contador++;


let u=x.val();



listaUsuarios.innerHTML += `

<div class="item">

👤 <b>${u.nombre}</b>

<br>

Usuario: ${u.usuario}

<br>

Clave: ${u.clave}


<button class="eliminar"
onclick="borrarUsuario('${x.key}')">

Eliminar usuario

</button>

</div>

`;


});


totalUsuarios.innerHTML =
"Usuarios inscritos: "+contador;


});





// SUBASTAS


db.ref("subastas")

.on("value", snap=>{


adminSubastas.innerHTML="";



snap.forEach(x=>{


let s=x.val();



adminSubastas.innerHTML +=`

<div class="item">

<h3>${s.titulo}</h3>

Valor actual:
$${s.precioActual.toLocaleString()}


<button class="eliminar"
onclick="eliminarSubasta('${x.key}')">

Eliminar subasta

</button>

</div>

`;



});


});


}







function borrarUsuario(id){

if(confirm("¿Eliminar usuario?")){

db.ref("usuarios/"+id).remove();

}

}





function eliminarSubasta(id){

if(confirm("¿Eliminar subasta?")){

db.ref("subastas/"+id).remove();

}

}









// ======================
// SUBASTAS ACTIVAS
// ======================


function verSubastas(){


mostrar("subastas");



db.ref("subastas")

.on("value", snap=>{


listaSubastas.innerHTML="";



snap.forEach(x=>{


let s=x.val();



if(s.estado=="ACTIVA"){



listaSubastas.innerHTML +=`

<div class="item">

<img class="foto" src="${s.imagen}">


<h2>${s.titulo}</h2>


<h3>$${s.precioActual.toLocaleString()}</h3>


<button onclick="abrirSubasta('${x.key}')">

Entrar

</button>

</div>

`;



}


});


});


}









// ======================
// DETALLE SUBASTA
// ======================


function abrirSubasta(id){


subastaActual=id;


mostrar("detalle");



db.ref("subastas/"+id)

.on("value", snap=>{


datosSubasta=snap.val();



foto.src=datosSubasta.imagen;


nombreSubasta.innerHTML=datosSubasta.titulo;


texto.innerHTML=datosSubasta.descripcion;


precio.innerHTML=

"$"+datosSubasta.precioActual.toLocaleString();


});



btnPuja.onclick=pujar;


cargarRanking();


}









// ======================
// PUJAR
// ======================


function pujar(){


let nuevoValor =

datosSubasta.precioActual +

datosSubasta.incremento;



db.ref(
"subastas/"+subastaActual+"/ofertas"
)

.push({

usuario:usuarioActivo.usuario,

nombre:usuarioActivo.nombre,

valor:nuevoValor,

fecha:new Date().toLocaleString()

});



db.ref(
"subastas/"+subastaActual+"/precioActual"
)

.set(nuevoValor);


}








// ======================
// TOP 5
// ======================


function cargarRanking(){


db.ref(
"subastas/"+subastaActual+"/ofertas"
)

.on("value", snap=>{


let datos=[];



snap.forEach(x=>{

datos.push(x.val());

});



datos.sort((a,b)=>b.valor-a.valor);



ranking.innerHTML="";



datos.slice(0,5)

.forEach((x,i)=>{


if(i==0){

lider.innerHTML=x.usuario;

}



ranking.innerHTML +=`

<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>

`;


});


});


}
