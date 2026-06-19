// ======================
// FIREBASE
// ======================

const firebaseConfig={

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


// VARIABLES

let usuarioActivo=null;
let subastaActual="";
let datosSubasta={};
let imagenSubasta="";
let reloj=null;


// ======================
// PANTALLAS
// ======================

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(x=>x.style.display="none");

document.getElementById(id).style.display="block";

}



// ======================
// IMAGEN
// ======================

function cargarImagen(e){

let archivo=e.target.files[0];

if(!archivo)return;


let lector=new FileReader();


lector.onload=function(){

imagenSubasta=lector.result;

previewImagen.src=imagenSubasta;

previewImagen.style.display="block";

}

lector.readAsDataURL(archivo);

}



// ======================
// USUARIOS
// ======================

function crearUsuario(){

let user=usuario.value.trim().toLowerCase();


if(!nombre.value || !user || !password.value){

alert("Completa los datos");

return;

}


if(!acepta.checked){

alert("Debes aceptar la condición");

return;

}


db.ref("usuarios/"+user)

.once("value",s=>{


if(s.exists()){

alert("Usuario existe");

return;

}


db.ref("usuarios/"+user)

.set({

nombre:nombre.value,
usuario:user,
clave:password.value

});


alert("Usuario creado");


nombre.value="";
usuario.value="";
password.value="";
acepta.checked=false;


});

}



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


db.ref("subastas/"+id)

.set({

titulo:titulo.value,
imagen:imagenSubasta,
descripcion:descripcion.value,

precioBase:Number(base.value),
precioActual:Number(base.value),

incremento:Number(incremento.value),

fin:fin.value,

estado:"ACTIVA"

});


alert("Subasta creada");


}



// ======================
// ADMIN PANEL
// ======================


function cargarAdmin(){


// USUARIOS


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





// SUBASTAS EDITABLES


db.ref("subastas")

.on("value",s=>{


adminSubastas.innerHTML="";


s.forEach(x=>{


let d=x.val();


adminSubastas.innerHTML+=`

<div class="item">


<img class="foto" src="${d.imagen}">


<input 
id="titulo_${x.key}"
value="${d.titulo}"
>


<textarea id="descripcion_${x.key}">

${d.descripcion}

</textarea>


<input 
id="base_${x.key}"
type="number"
value="${d.precioBase}"
>


<input
id="incremento_${x.key}"
type="number"
value="${d.incremento}"
>


<input
id="fin_${x.key}"
type="datetime-local"
value="${d.fin}"
>


Estado:

${d.estado}


<button onclick="editarSubasta('${x.key}')">

💾 Guardar cambios

</button>


<button class="eliminar"
onclick="eliminarSubasta('${x.key}')">

Eliminar

</button>


</div>

`;

});


});


}




// ======================
// EDITAR SUBASTA
// ======================


function editarSubasta(id){


db.ref("subastas/"+id)

.update({


titulo:
document.getElementById("titulo_"+id).value,


descripcion:
document.getElementById("descripcion_"+id).value,


precioBase:Number(
document.getElementById("base_"+id).value
),


incremento:Number(
document.getElementById("incremento_"+id).value
),


fin:
document.getElementById("fin_"+id).value


})

.then(()=>{

alert("Subasta actualizada");

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

.on("value",s=>{


listaSubastas.innerHTML="";


s.forEach(x=>{


let d=x.val();


listaSubastas.innerHTML+=`

<div class="item">

<img class="foto" src="${d.imagen}">


<h2>${d.titulo}</h2>


<h3>

$${d.precioActual.toLocaleString()}

</h3>


<button onclick="abrirSubasta('${x.key}')">

Entrar

</button>


</div>

`;

});


});


}



// ======================
// ABRIR
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

alert("Terminada");

return;

}


let valor=

datosSubasta.precioActual+

datosSubasta.incremento;


db.ref(
"subastas/"+subastaActual+"/ofertas"
)

.push({

usuario:usuarioActivo.usuario,

valor:valor

});


db.ref(
"subastas/"+subastaActual+"/precioActual"
)

.set(valor);


}





// ======================
// TIEMPO
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


db.ref("subastas/"+subastaActual)

.update({

estado:"FINALIZADA"

});


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
// TOP 5 REAL
// ======================


function rankingLive(){


db.ref(
"subastas/"+subastaActual+"/ofertas"
)

.on("value",s=>{


let usuarios={};


s.forEach(x=>{


let p=x.val();


if(!usuarios[p.usuario] ||
p.valor>usuarios[p.usuario].valor){

usuarios[p.usuario]=p;

}

});


let lista=Object.values(usuarios);


lista.sort((a,b)=>b.valor-a.valor);


ranking.innerHTML="";


lista.slice(0,5)

.forEach((x,i)=>{


if(i==0){

lider.innerHTML=x.usuario;

estadoFinal.innerHTML=

"🏆 Ganador actual:<br>"+x.usuario;

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
