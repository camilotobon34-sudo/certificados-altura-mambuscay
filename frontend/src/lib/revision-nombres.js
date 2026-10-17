// Revisión de nombres: solo avisa si hay números, símbolos o letras imposibles.
// No pone tildes ni trata las minúsculas como error: se guarda lo que escribieron,
// solo se ordenan mayúsculas al guardar.

const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'san'])

const capitalizar = (palabra, i) =>
  PARTICULAS.has(palabra.toLowerCase()) && (i > 0 || palabra === palabra.toLowerCase())
    ? palabra.toLowerCase()
    : palabra.toLowerCase().replace(/(^|[-'])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())

export const formatoNombre = (texto) => texto.trim().split(/\s+/).filter(Boolean).map(capitalizar).join(' ')

/**
 * Revisa un campo (`nombres` o `apellidos`). Devuelve avisos reales;
 * no sugiere tildes ni cambios de mayúsculas.
 */
export function revisarNombre(valor) {
  const texto = valor ?? ''
  if (texto.trim().length < 2) return { avisos: [], propuesto: null }
  const avisos = []

  if (/[^\p{L}\s'.-]/u.test(texto)) avisos.push('Tiene números o símbolos.')
  const repetida = texto.match(/(\p{L})\1\1/iu)
  if (repetida) avisos.push(`Tiene la letra «${repetida[1]}» repetida tres veces o más.`)
  for (const palabra of formatoNombre(texto).split(' ')) {
    if (palabra.length >= 2 && !/[aeiouáéíóúü]/i.test(palabra) && !PARTICULAS.has(palabra.toLowerCase())) {
      avisos.push(`«${palabra}» no tiene vocales.`)
    }
  }

  return { avisos, propuesto: null }
}
