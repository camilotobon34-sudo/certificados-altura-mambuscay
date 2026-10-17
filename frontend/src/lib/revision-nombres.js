// Revisión de nombres y apellidos al registrar una persona: solo avisa, nunca impide guardar,
// porque hay nombres poco comunes que están bien escritos.

const NOMBRES = `Aarón Abel Abelardo Abigail Abraham Adela Adelaida Adolfo Adriana Adrián Agustín Aída Alan Alba
Albeiro Alberto Alcides Aldemar Alejandra Alejandro Alexander Alexandra Alexis Alfonso Alfredo Alicia Alirio Alison
Estiven Stiven Steven Fredy Jefferson Yeferson Jhoan Johan Yurany Yuri Yhon Jhony Dayana Leidi Yeimi Wilder Weimar
Alonso Álvaro Amanda Amparo Ana Anderson Andrea Andrés Ángel Ángela Angélica Angie Aníbal Antonia Antonio Arcesio
Ariel Armando Arnulfo Arturo Aurora Beatriz Benjamín Bernardo Berta Blanca Brayan Brian Bryan Camila Camilo Carlos
Carmen Carolina Catalina Cecilia Celina César Cristian Christian Cristina Cristóbal Daniel Daniela Danilo Dario Darío
David Débora Deisy Diana Diego Dilan Dolly Dora Duván Edgar Edilberto Edison Edwin Eduardo Elena Eliana Elías Elizabeth
Elkin Emilio Emiliano Emma Enrique Erika Ernesto Esperanza Esteban Estefanía Estela Eugenia Eugenio Evelyn Fabián Fabio
Fanny Fátima Federico Felipe Fernanda Fernando Flor Francisco Freddy Gabriel Gabriela Germán Gerardo Gilberto Gina
Gladys Gloria Gonzalo Graciela Guillermo Gustavo Harold Héctor Heidy Helena Hernán Hernando Hilda Horacio Hugo Humberto
Ignacio Inés Isabel Isabella Ismael Iván Jaime Jairo Javier Jazmín Jeison Jenny Jennifer Jéssica Jesús Jhon Jhonatan
Jhonny Jimena Joaquín Johana Johanna John Jonathan Jorge José Josefina Juan Juana Julián Juliana Julio Julieta Karen
Karina Katherine Kelly Kevin Laura Leidy Leonardo León Leonel Leticia Libardo Lida Liliana Lina Lorena Lucas Lucía
Lucila Luis Luisa Luz Luzmila Manuel Manuela Marcela Marco Marcos Margarita María Mariana Maribel Marina Mario Marisol
Marlon Marta Martha Martín Mateo Matías Mauricio Mercedes Miguel Milena Miriam Mónica Natalia Nelly Nelson Néstor Nicolás
Nidia Nohora Norma Nubia Óscar Oscar Olga Omar Orlando Pablo Paola Patricia Paula Pedro Rafael Ramiro Ramón Raúl Rebeca
Ricardo Roberto Rocío Rodrigo Rosa Rosalba Rosario Rubén Ruth Salomé Samuel Sandra Santiago Sara Sebastián Sergio
Silvia Simón Sofía Sonia Stella Susana Tatiana Teresa Tomás Valentina Valeria Vanessa Verónica Víctor Vilma Viviana
Wilmer Wilson William Ximena Yamile Yaneth Yeison Yenny Yesid Yesit Yolanda Yuliana Yuly Zoraida`

const APELLIDOS = `Acevedo Acosta Agudelo Aguilar Aguirre Alarcón Álvarez Alzate Amaya Andrade Ángel Arango Araújo
Arbeláez Arboleda Arenas Arias Aristizábal Arroyave Ávila Bedoya Beltrán Benítez Bermúdez Betancur Betancourt Blandón
Bolívar Botero Bravo Buitrago Bustamante Caballero Cabrera Calderón Camacho Campillo Cano Cárdenas Cardona Carmona
Carrillo Carvajal Castaño Castillo Castro Ceballos Cifuentes Contreras Correa Cortés Cruz Cuéllar Chávez Daza Delgado
Díaz Duarte Durán Echeverri Escobar Espinosa Estrada Fernández Flórez Franco Galeano Gallego Galvis García Garzón
Gaviria Gil Giraldo Gómez González Granada Guerrero Guevara Gutiérrez Guzmán Henao Hernández Herrera Hincapié Hoyos
Ibáñez Isaza Jaramillo Jiménez Lara Largo León Londoño López Lozano Luna Maldonado Marín Marulanda Martínez Medina
Mejía Meneses Mendoza Mesa Molina Monsalve Montes Montoya Mora Morales Moreno Mosquera Muñoz Murillo Narváez Navarro
Nieto Niño Núñez Ocampo Ochoa Orozco Ortega Ortiz Osorio Ospina Pacheco Palacio Palacios Pardo Parra Patiño Peña
Pérez Pineda Pinilla Pinto Posada Prieto Quintero Quiroga Ramírez Ramos Restrepo Reyes Rincón Ríos Rivera Rodríguez
Rojas Romero Rosero Rubio Ruiz Salazar Salcedo Sánchez Sandoval Santos Sepúlveda Serna Sierra Silva Soto Suárez Tabares
Tamayo Tobón Toro Torre Torres Trujillo Uribe Valencia Valderrama Vallejo Vanegas Vargas Vásquez Velásquez Vélez Vergara Villa
Villegas Zapata Zuluaga`

export const sinTildes = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const clave = (palabra) => sinTildes(palabra).toLowerCase()

const diccionario = (lista) => {
  const mapa = new Map()
  for (const palabra of lista.split(/\s+/).filter(Boolean)) {
    // Si hay dos formas (Oscar/Óscar), se respeta la que la persona escribió.
    if (!mapa.has(clave(palabra))) mapa.set(clave(palabra), palabra)
    else mapa.set(clave(palabra), null)
  }
  return mapa
}

const DICCIONARIOS = { nombres: diccionario(NOMBRES), apellidos: diccionario(APELLIDOS) }
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'san'])

// "de la Torre" y "De la Torre" son válidos; dentro del nombre las partículas van en minúscula.
const capitalizar = (palabra, i) =>
  PARTICULAS.has(palabra.toLowerCase()) && (i > 0 || palabra === palabra.toLowerCase())
    ? palabra.toLowerCase()
    : palabra.toLowerCase().replace(/(^|[-'])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())

export const formatoNombre = (texto) => texto.trim().split(/\s+/).filter(Boolean).map(capitalizar).join(' ')

const sugerenciaPara = (palabra, campo) => {
  const k = clave(palabra)
  if (k.length < 3 || PARTICULAS.has(k)) return null
  const correcta = DICCIONARIOS[campo].get(k)
  // Solo tildes o mayúsculas (Perez → Pérez). Nunca cambiar un apellido válido por otro
  // parecido (Pérez no debe pasar a Perea).
  if (correcta) return palabra.toLowerCase() !== correcta.toLowerCase() ? correcta : null
  return null
}

/**
 * Revisa un campo (`nombres` o `apellidos`). Devuelve los avisos y, si el sistema puede
 * arreglarlo, `propuesto`: el texto completo con todas las correcciones aplicadas.
 */
export function revisarNombre(valor, campo) {
  const texto = valor ?? ''
  if (texto.trim().length < 2) return { avisos: [], propuesto: null }
  const avisos = []
  const ordenado = formatoNombre(texto)

  if (/[^\p{L}\s'.-]/u.test(texto)) avisos.push('Tiene números o símbolos.')
  const repetida = texto.match(/(\p{L})\1\1/iu)
  if (repetida) avisos.push(`Tiene la letra «${repetida[1]}» repetida tres veces o más.`)
  for (const palabra of ordenado.split(' ')) {
    if (palabra.length >= 2 && !/[aeiouáéíóúü]/i.test(palabra) && !PARTICULAS.has(palabra.toLowerCase())) {
      avisos.push(`«${palabra}» no tiene vocales.`)
    }
  }

  const palabras = ordenado.split(' ')
  const corregidas = palabras.map((p) => sugerenciaPara(p, campo) ?? p)
  palabras.forEach((p, i) => {
    if (corregidas[i] !== p) avisos.push(`¿Quiso decir «${corregidas[i]}» en lugar de «${p}»?`)
  })

  if (ordenado !== texto.trim() || texto !== texto.trim()) {
    avisos.push(
      /\s{2,}|^\s|\s$/.test(texto)
        ? 'Tiene espacios de más.'
        : texto === texto.toUpperCase()
          ? 'Está todo en mayúsculas.'
          : texto === texto.toLowerCase()
            ? 'Está todo en minúsculas.'
            : 'Las mayúsculas no están al inicio de cada palabra.',
    )
  }

  const propuesto = corregidas.join(' ')
  return { avisos, propuesto: propuesto !== texto ? propuesto : null }
}
