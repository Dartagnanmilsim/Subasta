// ======================
// FIREBASE SUBASTA PRO
// ======================

const firebaseConfig = {

apiKey: "AIzaSyB2CneyvJ35naCILtwFNUo3hhPRFM4tkyo",

authDomain: "subasta-pro.firebaseapp.com",

databaseURL: "https://subasta-pro-default-rtdb.firebaseio.com",

projectId: "subasta-pro",

storageBucket: "subasta-pro.firebasestorage.app",

messagingSenderId: "110324102442",

appId: "1:110324102442:web:055c40606660a2574b5a53"

};


firebase.initializeApp(firebaseConfig);

const db=firebase.database();



// VARIABLES

let usuarioActual =
localStorage.getItem("usuarioSubasta");


let idSubasta="";

let subasta={};



// CAMBIAR PANTALLA

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>p.style.display="none");

document.getElementById(id)
.style.display="block";

}





// CREAR USUARIO

function crearUsuario(){


let u=usuario.value.trim();


if(!nombre.value || !u){

alert("Completa los datos");
return;

}


if(!acepta.checked){

alert("Debes aceptar pagar si ganas");
return;

}



db.ref("usuarios/"+u)

.once("value",s=>{


if(s.exists()){

alert("Usuario ya existe");

}else{


db.ref("usuarios/"+u)

.set({

nombre:nombre.value,

usuario:u,

acepta:true,

fecha:new Date().toLocaleString()

});



localStorage.setItem(
"usuarioSubasta",
u
);


usuarioActual=u;


alert("Usuario creado");


}


});


}







// ADMIN

function loginAdmin(){


if(clave.value!="1234"){

alert("Clave incorrecta");
return;

}


mostrar("admin");

cargarAdmin();


}







// CREAR SUBASTA

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

})

.then(()=>{

alert("Subasta creada");

});


}







// ADMIN LISTADO

function cargarAdmin(){



db.ref("usuarios")

.on("value",s=>{


let total=0;


s.forEach(()=>total++);


totalUsuarios.innerHTML=

"Usuarios inscritos: "+total;


});





db.ref("subastas")

.on("value",s=>{


adminSubastas.innerHTML="";



s.forEach(x=>{


let d=x.val();



adminSubastas.innerHTML+=`

<div class="subasta">

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





// ELIMINAR

function eliminar(id){


db.ref("subastas/"+id)

.remove();


}







// VER SUBASTAS

function verSubastas(){


mostrar("subastas");



db.ref("subastas")

.on("value",s=>{


listaSubastas.innerHTML="";



s.forEach(x=>{


let d=x.val();



if(d.estado=="ACTIVA"){



listaSubastas.innerHTML+=`

<div class="subasta">

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







// ABRIR SUBASTA

function abrir(id){


if(!usuarioActual){

alert("Debe crear usuario primero");
return;

}


idSubasta=id;


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






// PUJAR

function pujar(){


let valor=

subasta.precioActual+

subasta.incremento;



db.ref(
"subastas/"+idSubasta+"/ofertas"
)

.push({

usuario:usuarioActual,

valor:valor,

fecha:new Date().toLocaleString()

});



db.ref(

"subastas/"+idSubasta+"/precioActual"

)

.set(valor);


}







// TOP 5

function rankingLive(){


db.ref(

"subastas/"+idSubasta+"/ofertas"

)

.on("value",s=>{


let lista=[];


s.forEach(x=>lista.push(x.val()));



lista.sort(

(a,b)=>b.valor-a.valor

);


ranking.innerHTML="";



lista.slice(0,5)

.forEach((x,i)=>{


if(i==0){

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
