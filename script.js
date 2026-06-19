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

const db=firebase.database();


// ======================
// VARIABLES
// ======================

let usuarioActivo=null;
let subastaActual="";
let datosSubasta={};
let imagenSubasta="";
let reloj=null;


// ======================
// NAVEGACION
// ======================

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>p.style.display="none");

document.getElementById(id).style.display="block";

}


// ======================
// CARGAR IMAGEN
// ======================

function cargarImagen(e){

let archivo=e.target.files[0];

if(!archivo)return;

let reader=new FileReader();

reader.onload=function(){

imagenSubasta=reader.result;

previewImagen.src=imagenSubasta;

previewImagen.style.display="block";

}

reader.readAsDataURL(archivo);

}


// ======================
// CREAR USUARIO
// ======================

function crearUsuario(){

let user=usuario.value.trim().toLowerCase();

if(
nombre.value=="" ||
user=="" ||
password.value==""
){

alert("Completa los datos");
return;

}


if(!acepta.checked){

alert("Debes aceptar pagar si ganas");
return;

}


db.ref("usuarios/"+user)

.once("value",s=>{


if(s.exists()){

alert("Usuario ya existe");
return;

}


db.ref("usuarios/"+user).set({

nombre:nombre.value,

usuario:user,

clave:password.value,

fecha:new Date().toLocaleString()

});


alert("Usuario creado");


nombre.value="";
usuario.value="";
password.value="";
acepta.checked=false;


});


}



// ======================
// LOGIN PARTICIPANTE
// ======================

function entrarUsuario(){

let user=loginUser.value.trim().toLowerCase();


db.ref("usuarios/"+user)

.once("value",s=>{


if(!s.exists()){

alert("Usuario no existe");
return;

}


let u=s.val();


if(u.clave!==loginPass.value){

alert("Clave incorrecta");
return;

}


usuarioActivo=u;


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


let id="SUB_"+Date.now();


db.ref("subastas/"+id).set({


titulo:titulo.value,

imagen:imagenSubasta,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

estado:"ACTIVA",

fin:fin.value

});


alert("Subasta creada");


titulo.value="";
descripcion.value="";
base.value="";
incremento.value="";
fin.value="";
imagenArchivo.value="";
previewImagen.style.display="none";
imagenSubasta="";


}



// ======================
// PANEL ADMIN
// ======================

function cargarAdmin(){


// usuarios

db.ref("usuarios")

.on("value",s=>{


listaUsuarios.innerHTML="";

let total=0;


s.forEach(x=>{


total++;


let u=x.val();


listaUsuarios.innerHTML+=`

<div class="usuario">

👤 ${u.nombre}

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


// subastas

db.ref("subastas")

.on("value",s=>{


adminSubastas.innerHTML="";


s.forEach(x=>{


let d=x.val();


adminSubastas.innerHTML+=`

<div class="item">

<img class="foto" src="${d.imagen}">

<h3>${d.titulo}</h3>

Estado: ${d.estado}

<br>

Valor: $${d.precioActual.toLocaleString()}


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
// SUBASTAS ACTIVAS
// ======================

function verSubastas(){

mostrar("subastas");


db.ref("subastas")

.on("value",s=>{


listaSubastas.innerHTML="";


s.forEach(x=>{


let d=x.val();


listaSubastas.innerHTML+=`

<div class="item">

<img class="foto" src="${d.imagen}">

<h2>${d.titulo}</h2>

<h3>$${d.precioActual.toLocaleString()}</h3>


<button onclick="abrirSubasta('${x.key}')">

Entrar

</button>

</div>

`;

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

.on("value",s=>{


datosSubasta=s.val();


foto.src=datosSubasta.imagen;

nombreSubasta.innerHTML=datosSubasta.titulo;

texto.innerHTML=datosSubasta.descripcion;


precio.innerHTML=

"$"+datosSubasta.precioActual.toLocaleString();


controlTiempo();


});


btnPuja.onclick=pujar;


rankingLive();


}



// ======================
// PUJAR
// ======================

function pujar(){


if(datosSubasta.estado=="FINALIZADA"){

alert("Subasta terminada");
return;

}


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
// CONTROL TIEMPO
// ======================

function controlTiempo(){


clearInterval(reloj);


reloj=setInterval(()=>{


let falta=

new Date(datosSubasta.fin).getTime()

-Date.now();


if(falta<=0){


tiempoRestante.innerHTML="FINALIZADA";

btnPuja.style.display="none";


db.ref(
"subastas/"+subastaActual+"/estado"
)
.set("FINALIZADA");


clearInterval(reloj);


return;

}


let h=Math.floor(falta/3600000);

let m=Math.floor((falta%3600000)/60000);

let s=Math.floor((falta%60000)/1000);


tiempoRestante.innerHTML=

h+"h "+m+"m "+s+"s";


},1000);


}



// ======================
// TOP 5 HISTORICO REAL
// ======================

function rankingLive(){


db.ref(
"subastas/"+subastaActual+"/ofertas"
)

.on("value",s=>{


let usuarios={};


s.forEach(x=>{


let p=x.val();


if(
!usuarios[p.usuario] ||
p.valor>usuarios[p.usuario].valor
){

usuarios[p.usuario]=p;

}


});


let lista=Object.values(usuarios);


lista.sort(
(a,b)=>b.valor-a.valor
);


ranking.innerHTML="";


lista.forEach((x,i)=>{


if(i==0){

lider.innerHTML=x.usuario;


estadoFinal.innerHTML=

"🏆 Ganador actual:<br>"+x.usuario;

}


if(i<5){


ranking.innerHTML+=`

<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>

`;

}


});


});


}
