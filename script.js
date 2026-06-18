// ==========================
// FIREBASE
// ==========================

const firebaseConfig = {

apiKey:"TU_API_KEY",

authDomain:"TU_PROYECTO.firebaseapp.com",

databaseURL:"TU_DATABASE_URL",

projectId:"TU_ID"

};


firebase.initializeApp(firebaseConfig);

const db = firebase.database();



// ==========================
// VARIABLES
// ==========================

let usuarioActual =
localStorage.getItem("usuarioSubasta");

let subastaActual = "";

let datosSubasta = {};



// ==========================
// CAMBIO DE PANTALLAS
// ==========================

function mostrar(id){

document.querySelectorAll(".pantalla")
.forEach(p=>{

p.style.display="none";

});


document.getElementById(id)
.style.display="block";

}






// ==========================
// CREAR USUARIO
// ==========================

function crearUsuario(){


let user = usuario.value.trim();


if(!nombre.value){

alert("Ingrese nombre");

return;

}


if(!user){

alert("Ingrese usuario");

return;

}



if(!acepta.checked){

alert("Debe aceptar pagar si gana");

return;

}




db.ref("usuarios/"+user)

.once("value")

.then(snap=>{


if(snap.exists()){


alert("Usuario ya existe");

return;


}




db.ref("usuarios/"+user)

.set({


nombre:nombre.value,

usuario:user,

acepta:true,

fecha:
new Date().toLocaleString()


})

.then(()=>{


localStorage.setItem(

"usuarioSubasta",

user

);



usuarioActual=user;



alert("Usuario creado");


});


});


}







// ==========================
// LOGIN ADMIN
// ==========================


function entrarAdmin(){



if(clave.value!="1234"){


alert("Clave incorrecta");

return;

}



mostrar("admin");


cargarAdmin();


}








// ==========================
// CREAR SUBASTA
// ==========================


function crearSubasta(){



if(!titulo.value){

alert("Nombre obligatorio");

return;

}



let id=

"SUB_"+Date.now();



let datos={



titulo:titulo.value,

imagen:imagen.value,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

fin:fin.value,

estado:"ACTIVA",

fecha:
new Date().toLocaleString()


};




db.ref("subastas/"+id)

.set(datos)

.then(()=>{



alert("Subasta creada");



titulo.value="";

imagen.value="";

descripcion.value="";

base.value="";

incremento.value="";

fin.value="";



cargarAdmin();



})

.catch(e=>{


alert(e.message);


});


}








// ==========================
// ADMIN
// ==========================


function cargarAdmin(){


// usuarios


db.ref("usuarios")

.on("value",snap=>{


let total=0;


snap.forEach(()=>{

total++;

});



totalUsuarios.innerHTML=

"Usuarios inscritos: "+total;


});





// subastas creadas


db.ref("subastas")

.on("value",snap=>{



adminSubastas.innerHTML="";



if(!snap.exists()){


adminSubastas.innerHTML=

"<p>No hay subastas</p>";

return;


}



snap.forEach(item=>{



let s=item.val();



adminSubastas.innerHTML += `


<div class="subastaCard">


<h3>${s.titulo}</h3>


<p>

Valor actual:

<b>

$${s.precioActual.toLocaleString()}

</b>

</p>



<button 
class="eliminar"

onclick="eliminar('${item.key}')">

Eliminar

</button>


</div>


`;



});



});


}








// ==========================
// ELIMINAR SUBASTA
// ==========================


function eliminar(id){



if(confirm("Eliminar subasta?")){


db.ref("subastas/"+id)

.remove();


}


}









// ==========================
// SUBASTAS ACTIVAS
// ==========================


function cargarSubastas(){



mostrar("subastas");



db.ref("subastas")

.on("value",snap=>{



listaSubastas.innerHTML="";



snap.forEach(item=>{



let s=item.val();



if(s.estado==="ACTIVA"){



listaSubastas.innerHTML+=`


<div class="subastaCard">


<img class="foto" src="${s.imagen}">


<h2>${s.titulo}</h2>


<h3>

$${s.precioActual.toLocaleString()}

</h3>


<button onclick="abrir('${item.key}')">

Entrar

</button>


</div>


`;



}



});


});


}








// ==========================
// ABRIR SUBASTA
// ==========================


function abrir(id){



if(!usuarioActual){


alert("Primero cree usuario");

return;


}



subastaActual=id;


mostrar("detalle");




db.ref("subastas/"+id)

.on("value",snap=>{



datosSubasta=snap.val();



foto.src=

datosSubasta.imagen;



nombreSubasta.innerHTML=

datosSubasta.titulo;



texto.innerHTML=

datosSubasta.descripcion;




valorActual.innerHTML=

"$"+

datosSubasta.precioActual

.toLocaleString();



});




botonOferta.onclick=pujar;



rankingLive();


}









// ==========================
// PUJAR
// ==========================


function pujar(){



let nuevoValor=

datosSubasta.precioActual+

datosSubasta.incremento;



db.ref(

"subastas/"+subastaActual+"/ofertas"

)

.push({



usuario:usuarioActual,


valor:nuevoValor,


fecha:

new Date().toLocaleString()



});





db.ref(

"subastas/"+subastaActual+

"/precioActual"

)

.set(nuevoValor);



}








// ==========================
// TOP 5
// ==========================


function rankingLive(){



db.ref(

"subastas/"+subastaActual+

"/ofertas"

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




ranking.innerHTML += `


<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>


`;



});



});


}
