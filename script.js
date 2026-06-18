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

let subastaId="";

let subasta={};



// PANTALLAS

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(x=>x.style.display="none");

document.getElementById(id).style.display="block";

}






// ======================
// CREAR USUARIO
// ======================


function crearUsuario(){


let user=usuario.value.trim();



if(!nombre.value || !user || !password.value){

alert("Completa todos los datos");

return;

}



if(!acepta.checked){

alert("Debes aceptar la condición");

return;

}



db.ref("usuarios/"+user)

.once("value",s=>{



if(s.exists()){

alert("Usuario ya existe");

return;

}



db.ref("usuarios/"+user)

.set({

nombre:nombre.value,

usuario:user,

clave:password.value,

acepta:true,

fecha:new Date().toLocaleString()

});


alert("Usuario creado");


});


}








// ======================
// LOGIN USUARIO
// ======================


function entrarUsuario(){



db.ref("usuarios/"+loginUser.value)

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

imagen:imagen.value,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

estado:"ACTIVA",

fin:fin.value

});


alert("Subasta creada");


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

<div class="item">

<b>${u.nombre}</b>

<br>

Usuario: ${u.usuario}

<br>

Clave: ${u.clave}

</div>

`;



});


totalUsuarios.innerHTML=

"Usuarios: "+total;


});




// subastas


db.ref("subastas")

.on("value",s=>{


adminSubastas.innerHTML="";



s.forEach(x=>{


let d=x.val();



adminSubastas.innerHTML+=`

<div class="item">

<h3>${d.titulo}</h3>


$${d.precioActual.toLocaleString()}


<button class="eliminar"

onclick="eliminar('${x.key}')">

Eliminar

</button>

</div>

`;



});


});


}








// ELIMINAR SUBASTA

function eliminar(id){

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



if(d.estado==="ACTIVA"){



listaSubastas.innerHTML+=`

<div class="item">

<img class="foto" src="${d.imagen}">


<h2>${d.titulo}</h2>


<h3>$${d.precioActual.toLocaleString()}</h3>


<button onclick="abrir('${x.key}')">

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


function abrir(id){


subastaId=id;


mostrar("detalle");



db.ref("subastas/"+id)

.on("value",s=>{


subasta=s.val();



foto.src=subasta.imagen;


nombreSubasta.innerHTML=subasta.titulo;


texto.innerHTML=subasta.descripcion;



precio.innerHTML=

"$"+subasta.precioActual.toLocaleString();


});


btnPuja.onclick=pujar;


rankingLive();


}








// ======================
// PUJAR
// ======================


function pujar(){



let valor=

subasta.precioActual+

subasta.incremento;



db.ref(

"subastas/"+subastaId+"/ofertas"

)

.push({

usuario:usuarioActivo.usuario,

nombre:usuarioActivo.nombre,

valor:valor,

fecha:new Date().toLocaleString()

});



db.ref(

"subastas/"+subastaId+"/precioActual"

)

.set(valor);


}








// ======================
// TOP 5
// ======================


function rankingLive(){


db.ref(

"subastas/"+subastaId+"/ofertas"

)

.on("value",s=>{


let lista=[];


s.forEach(x=>lista.push(x.val()));



lista.sort((a,b)=>b.valor-a.valor);



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
