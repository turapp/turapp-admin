// ============================================================
// IDENTIDAD DE CADA SERVICIO
// ============================================================
// Un conductor de taxi y uno de Viajes a Cali no hacen el mismo trabajo, no
// cobran igual y no esperan lo mismo de la app. Hasta ahora los dos veían la
// misma pantalla genérica.
//
// Aquí queda definido, en un solo lugar, qué es cada servicio: cómo se llama
// lo que hace, de qué color es, con qué pieza 3D se representa y qué necesita
// saber alguien que apenas se está inscribiendo.
//
// Los colores NO son nuevos: son los mismos de turapp.co (jade, ámbar, coral,
// tinta). Lo que cambia es cuál manda en cada servicio, para que el conductor
// reconozca en qué está con solo mirar.

export const SERVICIOS = {
  taxi: {
    id: 'taxi',
    nombre: 'Taxi',
    nombreLargo: 'Taxi en la ciudad',
    emoji: '🚕',
    imagen: '/images/3d_car.png',
    // Cómo se llama UNA unidad de trabajo. El conductor de taxi no recibe
    // "servicios": recibe carreras.
    trabajo: { uno: 'carrera', varios: 'carreras', verbo: 'Recibiendo carreras' },
    ciudad: 'Buenaventura',
    acento: '#c98a1e',
    acentoSuave: 'rgba(201,138,30,.12)',
    degradado: 'linear-gradient(145deg,#f3b13c 0%,#c98a1e 48%,#8a5f10 100%)',
    tagline: 'Tu placa amarilla, con pasajeros todo el día',
    promesa: 'La carrera mínima es de $6.900 y el pasajero puede sumarte un bono cuando quiere que lo recojan rápido.',
    requisitos: [
      'Licencia de conducción vigente, categoría C1 o superior',
      'Tarjeta de operación del taxi al día',
      'SOAT y tecnomecánica vigentes',
      'Placa amarilla registrada en Buenaventura',
    ],
    pasos: [
      {
        titulo: 'Te conectas cuando quieras',
        texto: 'No hay turnos ni horarios. Prendes el switch y empiezas a recibir carreras cerca de donde estés.',
      },
      {
        titulo: 'La carrera te llega con el precio ya puesto',
        texto: 'Ves cuánto vas a ganar, dónde recoges y para dónde va, antes de aceptar. Si el pasajero te agregó bono, también lo ves.',
      },
      {
        titulo: 'El bono del pasajero es tuyo completo',
        texto: 'Cuando hay pocos carros, el pasajero puede sumar entre $2.000 y $10.000 para que lo recojan primero. De ese bono no te descontamos nada.',
      },
      {
        titulo: 'Cobras por Nequi o te transferimos',
        texto: 'Si paga por Nequi, la plata te llega directo. Si paga con tarjeta, la juntamos y te la transferimos cada 3 días.',
      },
    ],
  },

  cali: {
    id: 'cali',
    nombre: 'Viajes a Cali',
    nombreLargo: 'Viajes a Cali',
    emoji: '🚐',
    imagen: '/images/3d_calendar.png',
    trabajo: { uno: 'reserva', varios: 'reservas', verbo: 'Recibiendo reservas' },
    ciudad: 'Buenaventura y Cali',
    acento: '#0f8a6d',
    acentoSuave: 'rgba(15,138,109,.12)',
    degradado: 'linear-gradient(145deg,#2fbf99 0%,#0f8a6d 48%,#075441 100%)',
    tagline: 'Llena tu van antes de salir del terminal',
    promesa: 'El pasajero abona el 30% al reservar. Sales con los puestos ya vendidos, no esperando a que se llenen.',
    requisitos: [
      'Placa blanca con habilitación intermunicipal',
      'Licencia de conducción vigente, categoría C1 o superior',
      'SOAT, tecnomecánica y póliza de responsabilidad civil',
      'Vehículo de 4 puestos o más',
    ],
    pasos: [
      {
        titulo: 'Publicas tu salida',
        texto: 'Dices a qué hora sales y cuántos puestos tienes. Los pasajeros de Buenaventura y de Cali la ven de una.',
      },
      {
        titulo: 'Ellos abonan el 30% para separar',
        texto: 'Ese abono es la garantía de que sí se montan. El resto te lo pagan a ti cuando abordan.',
      },
      {
        titulo: 'Tú decides cómo pagas la comisión',
        texto: 'O nos dejas el 15% de cada pasajero, o pagas el Plan Cali de $59.990 al mes y no pagas comisión por ninguno.',
      },
      {
        titulo: 'Desde 8 pasajeros al mes, el plan te conviene',
        texto: 'Con dos vans llenas ya lo pagaste. De ahí para arriba, todo lo que entre es tuyo.',
      },
    ],
  },

  favor: {
    id: 'favor',
    nombre: 'Encomiendas',
    nombreLargo: 'Tura Favor',
    emoji: '📦',
    imagen: '/images/3d_delivery.png',
    trabajo: { uno: 'encomienda', varios: 'encomiendas', verbo: 'Recibiendo encomiendas' },
    ciudad: 'Buenaventura',
    acento: '#c8402f',
    acentoSuave: 'rgba(200,64,47,.12)',
    degradado: 'linear-gradient(145deg,#e8735f 0%,#c8402f 48%,#8a2418 100%)',
    tagline: 'Llevas cosas, no personas',
    promesa: 'Recoges en un punto y dejas en otro. Nunca pones plata tuya: no compras nada, solo transportas.',
    requisitos: [
      'Bicicleta, moto o carro — con cualquiera puedes',
      'Cédula al día',
      'Si es moto o carro: licencia y SOAT vigentes',
      'Un celular con datos y GPS',
    ],
    pasos: [
      {
        titulo: 'Sirve hasta una bicicleta',
        texto: 'No necesitas carro. Los sobres y paquetes pequeños los puedes llevar en bici o en moto.',
      },
      {
        titulo: 'Te dicen qué es antes de aceptar',
        texto: 'Ves el tamaño, dónde recoges, dónde entregas y cuánto ganas. Si no te sirve, no la tomas.',
      },
      {
        titulo: 'Nunca pagas por el cliente',
        texto: 'Esto no es hacer mandados: nadie te va a pedir que compres algo con tu plata. Solo recoges y entregas.',
      },
      {
        titulo: 'Se paga por tamaño',
        texto: 'Sobre $6.900, paquete $9.900, grande $14.900, más $700 por kilómetro extra.',
      },
    ],
  },

  encomienda_intermunicipal: {
    id: 'encomienda_intermunicipal',
    nombre: 'Encomiendas fuera',
    nombreLargo: 'Encomiendas fuera de la ciudad',
    emoji: '🚚',
    imagen: '/images/3d_clock_car.png',
    trabajo: { uno: 'envío', varios: 'envíos', verbo: 'Recibiendo envíos' },
    ciudad: 'Fuera de Buenaventura',
    acento: '#3d2168',
    acentoSuave: 'rgba(61,33,104,.12)',
    degradado: 'linear-gradient(145deg,#6b45ad 0%,#3d2168 48%,#1a1330 100%)',
    tagline: 'Lo que sale de Buenaventura, sale contigo',
    promesa: 'Aprovechas el viaje que ya vas a hacer y le sumas los paquetes que van para el mismo lado.',
    requisitos: [
      'Placa blanca con habilitación intermunicipal',
      'Licencia de conducción vigente',
      'SOAT y tecnomecánica vigentes',
      'Espacio de carga disponible',
    ],
    pasos: [
      {
        titulo: 'Va montado en tu ruta',
        texto: 'Si ya vas para Cali, llevas también los paquetes que van para allá. El viaje es el mismo.',
      },
      {
        titulo: 'Ves el destino antes de aceptar',
        texto: 'Si el paquete no va para donde tú vas, no te aparece.',
      },
      {
        titulo: 'Queda registrado quién lo recibió',
        texto: 'Al entregar tomas la confirmación. Eso te protege a ti si después reclaman.',
      },
    ],
  },
};

// Orden en que se muestran. Taxi primero porque es el que más gente hace.
export const ORDEN = ['taxi', 'cali', 'favor', 'encomienda_intermunicipal'];

export const servicio = (id) => SERVICIOS[id] ?? SERVICIOS.taxi;

// Estética 3D/render compartida: una sola forma de dibujar el bloque de color
// con la pieza flotando, para que las cuatro pantallas se vean de la misma
// familia sin repetir 40 líneas de estilos.
export const escenaServicio = (s) => ({
  background: s.degradado,
  // Dos brillos: uno arriba a la izquierda (la luz) y otro difuso abajo
  // (el rebote). Es lo que hace que el bloque se vea con volumen y no plano.
  backgroundImage: `${s.degradado},
    radial-gradient(120% 90% at 18% 0%, rgba(255,255,255,.34), transparent 58%),
    radial-gradient(90% 70% at 88% 105%, rgba(0,0,0,.28), transparent 62%)`,
  backgroundBlendMode: 'normal, screen, multiply',
});
