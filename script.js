// =====================
// FIREBASE EXISTENTE
// =====================

const firebaseConfig={

apiKey:"TU_API_KEY",

authDomain:"TU_PROYECTO.firebaseapp.com",

databaseURL:"TU_DATABASE_URL",

projectId:"TU_ID"

};


firebase.initializeApp(firebaseConfig);

const db=firebase.database();



// VARIABLES

let usuarioActual =
localStorage.getItem("usuarioSubasta");


let subastaActual="";

let datosSubasta={};



// =====================
// NAVEGACIÓN
// =====================


function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>p.style.display="none");


document.getElementById(id)
.style.display="block";

}




// =====================
// CREAR USUARIO
// =====================


function crearUsuario(){


if(!acepta.checked){

alert("Debes aceptar la condición de pago");

return;

}


if(!usuario.value){

alert("Crea un usuario");

return;

}



db.ref("usuarios/"+usuario.value)

.once("value",snap=>{


if(snap.exists()){


alert("Usuario ya existe");


}else{


db.ref("usuarios/"+usuario.value)

.set({

nombre:nombre.value,

usuario:usuario.value,

acepta:true

});



localStorage.setItem(

"usuarioSubasta",

usuario.value

);


usuarioActual=usuario.value;


alert("Usuario creado");


}


});


}





// =====================
// ADMIN
// =====================


function entrarAdmin(){


if(clave.value==="1234"){


mostrar("admin");


}else{


alert("Clave incorrecta");


}


}






// =====================
// CREAR SUBASTA
// =====================


function crearSubasta(){



let id=Date.now();



db.ref("subastas/"+id)

.set({


titulo:titulo.value,

imagen:imagen.value,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

fin:fin.value,

estado:"ACTIVA"


});



alert("Subasta creada");


}







// =====================
// LISTAR SUBASTAS
// =====================


function cargarSubastas(){


mostrar("subastas");


listaSubastas.innerHTML="";



db.ref("subastas")

.once("value",snap=>{


snap.forEach(s=>{


let x=s.val();



if(x.estado==="ACTIVA"){



listaSubastas.innerHTML +=


`

<div class="card">

<h3>${x.titulo}</h3>

<p>$${x.precioActual.toLocaleString()}</p>

<button onclick="abrirSubasta('${s.key}')">

Entrar

</button>

</div>

`;


}


});


});


}







// =====================
// ABRIR SUBASTA
// =====================


function abrirSubasta(id){



if(!usuarioActual){


alert("Primero debes crear usuario");


return;


}



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



valorActual.innerHTML=

"$"+datosSubasta.precioActual.toLocaleString();


});



botonOferta.onclick=ofertar;



cargarRanking();


}







// =====================
// OFERTAR
// =====================


function ofertar(){



let nuevo=

datosSubasta.precioActual+

datosSubasta.incremento;



let oferta={


usuario:usuarioActual,

valor:nuevo,

fecha:new Date().toLocaleString()


};



db.ref(

"subastas/"+subastaActual+"/ofertas"

).push(oferta);




db.ref(

"subastas/"+subastaActual+"/precioActual"

).set(nuevo);



}







// =====================
// RANKING
// =====================


function cargarRanking(){



db.ref(

"subastas/"+subastaActual+"/ofertas"

).on("value",snap=>{



let datos=[];



snap.forEach(x=>{


datos.push(x.val());


});



datos.sort(

(a,b)=>b.valor-a.valor

);



ranking.innerHTML="";



datos.slice(0,5)

.forEach((x,i)=>{



if(i===0){

lider.innerHTML=x.usuario;

}



ranking.innerHTML +=

`

<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>

`;



});


});


}
