// =======================================
// CONFIGURACIÓN FIREBASE
// PEGAR LOS MISMOS DATOS DE LA APP POLLA
// =======================================

const firebaseConfig = {

apiKey: "TU_API_KEY",

authDomain: "TU_PROYECTO.firebaseapp.com",

databaseURL: "TU_DATABASE_URL",

projectId: "TU_ID"

};


firebase.initializeApp(firebaseConfig);


const db = firebase.database();



// Variable global

let subasta = {};




// =======================================
// CREAR SUBASTA ADMINISTRADOR
// =======================================


function crearSubasta(){


if(clave.value !== "1234"){

alert("Clave administrador incorrecta");

return;

}



let datosSubasta = {


producto: producto.value,

imagen: foto.value,

precioBase: Number(precioBase.value),

precioActual: Number(precioBase.value),

incremento: Number(incremento.value),

cierre: cierre.value,

estado: "ACTIVA",

fechaCreacion: new Date().toLocaleString()


};



// Guarda configuración

db.ref("subastas/configuracion")

.set(datosSubasta);



// Limpia ofertas anteriores

db.ref("subastas/ofertas")

.remove();



// Limpia ofertantes anteriores

db.ref("subastas/ofertantes")

.remove();



alert("Subasta creada correctamente");


}






// =======================================
// REALIZAR OFERTA
// =======================================


function ofertar(){



if(!subasta.estado){


alert("No existe subasta activa");


return;


}




if(subasta.estado !== "ACTIVA"){


alert("La subasta ya terminó");


return;


}





if(!nombre.value || !celular.value){


alert("Debes registrar nombre y celular");


return;


}





// Validar hora de cierre

if(new Date() > new Date(subasta.cierre)){



db.ref("subastas/configuracion/estado")

.set("FINALIZADA");



alert("Tiempo de subasta terminado");


return;


}





let nuevaOferta =

subasta.precioActual + subasta.incremento;





let oferta = {


nombre: nombre.value,

celular: celular.value,

correo: correo.value,

valor: nuevaOferta,

fecha: new Date().toLocaleString()


};




// Guarda usuario

db.ref("subastas/ofertantes")

.push({

nombre:nombre.value,

celular:celular.value,

correo:correo.value

});




// Guarda oferta

db.ref("subastas/ofertas")

.push(oferta);




// Actualiza precio actual

db.ref("subastas/configuracion/precioActual")

.set(nuevaOferta);



}







// =======================================
// ESCUCHAR SUBASTA EN TIEMPO REAL
// =======================================


db.ref("subastas/configuracion")

.on("value", snapshot => {



if(!snapshot.exists()){


return;


}



subasta = snapshot.val();




titulo.innerHTML =

subasta.producto;



imagenSubasta.src =

subasta.imagen;




base.innerHTML =

"$" + subasta.precioBase.toLocaleString();




actual.innerHTML =

"$" + subasta.precioActual.toLocaleString();



});









// =======================================
// RANKING TOP 5 EN VIVO
// =======================================


db.ref("subastas/ofertas")

.on("value", snapshot => {



let lista = [];



snapshot.forEach(item=>{


lista.push(item.val());


});




// ordenar mayor a menor

lista.sort((a,b)=>{


return b.valor - a.valor;


});




ranking.innerHTML="";




if(lista.length===0){



lider.innerHTML="Sin ofertas";

return;


}





lista.slice(0,5)

.forEach((persona,index)=>{



if(index===0){


lider.innerHTML = persona.nombre;


}





ranking.innerHTML += `


<li>

<strong>

${index+1}. ${persona.nombre}

</strong>

<br>

💰 $${persona.valor.toLocaleString()}

<br>

🕒 ${persona.fecha}

</li>


`;



});



});







// =======================================
// CERRAR SUBASTA MANUAL ADMIN
// =======================================


function cerrarSubasta(){



db.ref("subastas/configuracion/estado")

.set("FINALIZADA");



alert("Subasta cerrada");



}
