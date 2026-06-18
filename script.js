// ======================
// FIREBASE SUBASTA PRO
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

let usuarioActivo=null;

let subastaActual="";

let datosSubasta={};

let imagenSubasta="";



// ======================
// NAVEGACIÓN
// ======================

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>p.style.display="none");


document.getElementById(id)
.style.display="block";

}





// ======================
// CARGAR IMAGEN CELULAR
// ======================

function cargarImagen(event){


let archivo=event.target.files[0];


if(!archivo)return;



let lector=new FileReader();



lector.onload=function(){


imagenSubasta=lector.result;


previewImagen.src=imagenSubasta;


previewImagen.style.display="block";


};



lector.readAsDataURL(archivo);


}







// ======================
// CREAR USUARIO
// ======================

function crearUsuario(){


let user=usuario.value
.trim()
.toLowerCase();



if(
nombre.value.trim()=="" ||
user=="" ||
password.value==""
){

alert("Completa todos los datos");

return;

}



if(!acepta.checked){

alert("Debes aceptar la condición");

return;

}



db.ref("usuarios/"+user)

.once("value",snap=>{


if(snap.exists()){

alert("Usuario ya existe");

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



let user=loginUser.value
.trim()
.toLowerCase();



db.ref("usuarios/"+user)

.once("value",snap=>{


if(!snap.exists()){

alert("Usuario no existe");

return;

}



let u=snap.val();



if(u.clave!==loginPass.value){

alert("Contraseña incorrecta");

return;

}



usuarioActivo=u;



loginUser.value="";

loginPass.value="";



verSubastas();


});


}









// ======================
// ADMIN
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



if(
titulo.value=="" ||
base.value=="" ||
incremento.value==""
){


alert("Completa datos de la subasta");

return;

}



let id="SUB_"+Date.now();



db.ref("subastas/"+id)

.set({


titulo:titulo.value,

imagen:imagenSubasta,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

estado:"ACTIVA",

fin:fin.value,

creada:new Date().toLocaleString()


})

.then(()=>{


alert("Subasta creada");



titulo.value="";

descripcion.value="";

base.value="";

incremento.value="";

fin.value="";


imagenArchivo.value="";


previewImagen.style.display="none";


imagenSubasta="";


});


}









// ======================
// PANEL ADMIN
// ======================


function cargarAdmin(){


// USUARIOS


db.ref("usuarios")

.on("value",snap=>{


listaUsuarios.innerHTML="";


let total=0;



snap.forEach(x=>{


total++;


let u=x.val();



listaUsuarios.innerHTML+=`

<div class="usuario">

👤 <b>${u.nombre}</b>

<br>

Usuario: ${u.usuario}

<br>

Clave: ${u.clave}

<button class="eliminar"
onclick="eliminarUsuario('${x.key}')">

Eliminar

</button>

</div>

`;


});



totalUsuarios.innerHTML=

"Usuarios inscritos: "+total;


});





// SUBASTAS


db.ref("subastas")

.on("value",snap=>{


adminSubastas.innerHTML="";



snap.forEach(x=>{


let s=x.val();



adminSubastas.innerHTML+=`

<div class="item">

<img class="foto" src="${s.imagen}">

<h3>${s.titulo}</h3>


Valor actual:

<br>

$${s.precioActual.toLocaleString()}


<button class="eliminar"

onclick="eliminarSubasta('${x.key}')">

Eliminar

</button>

</div>

`;



});


});


}








function eliminarUsuario(id){


db.ref("usuarios/"+id).remove();


}





function eliminarSubasta(id){


db.ref("subastas/"+id).remove();


}









// ======================
// VER SUBASTAS
// ======================


function verSubastas(){



mostrar("subastas");



db.ref("subastas")

.on("value",snap=>{



listaSubastas.innerHTML="";



snap.forEach(x=>{



let s=x.val();



if(s.estado=="ACTIVA"){



listaSubastas.innerHTML+=`

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
// ABRIR SUBASTA
// ======================


function abrirSubasta(id){



subastaActual=id;



mostrar("detalle");



db.ref("subastas/"+id)

.on("value",snap=>{


datosSubasta=snap.val();



foto.src=datosSubasta.imagen;


nombreSubasta.innerHTML=

datosSubasta.titulo;


texto.innerHTML=

datosSubasta.descripcion;



precio.innerHTML=

"$"+datosSubasta.precioActual.toLocaleString();


});



btnPuja.onclick=pujar;



rankingLive();


}








// ======================
// PUJAR
// ======================


function pujar(){



let nuevo=

datosSubasta.precioActual+

datosSubasta.incremento;



db.ref(

"subastas/"+subastaActual+"/ofertas"

)

.push({


usuario:usuarioActivo.usuario,

nombre:usuarioActivo.nombre,

valor:nuevo,

fecha:new Date().toLocaleString()


});




db.ref(

"subastas/"+subastaActual+"/precioActual"

)

.set(nuevo);



}








// ======================
// TOP 5
// ======================


function rankingLive(){


db.ref(

"subastas/"+subastaActual+"/ofertas"

)

.on("value",snap=>{


let lista=[];


snap.forEach(x=>{

lista.push(x.val());

});



lista.sort(

(a,b)=>b.valor-a.valor

);



ranking.innerHTML="";



lista.slice(0,5)

.forEach((x,i)=>{



if(i===0){

lider.innerHTML=x.usuario;

}



ranking.innerHTML+=`

<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>

`;



});


});


}
