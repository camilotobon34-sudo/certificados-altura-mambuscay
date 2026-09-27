import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { LOGO_URL, NOMBRE_EMPRESA, NOMBRE_SISTEMA } from './brand.js'
import { ESTADOS } from './constants.js'
import { formatDate, formatDateTime } from './format.js'

// Colores de docs/01-identidad-visual (1.3).
const COLOR = {
  primary: '#0A3A4A',
  accent: '#D97706',
  ink: '#1A2332',
  muted: '#5B6B7A',
  line: '#D0DAE2',
  surface: '#F3F6F8',
  VIGENTE: '#15803D',
  VENCIDO: '#B45309',
  SUSPENDIDO: '#0369A1',
  ANULADO: '#B91C1C',
}

// Las fuentes estándar de PDF solo cubren Latin-1.
const pdfText = (value) => String(value ?? '-').replace(/[—–]/g, '-')

// Conserva el tamaño y la proporción originales del logo.
const cargarLogo = () =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve({ data: canvas.toDataURL('image/png'), ratio: img.naturalWidth / img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = LOGO_URL
  })

/**
 * Genera y descarga la constancia en PDF. Solo recibe datos públicos (RF-16):
 * el documento llega ya enmascarado y nunca se incluyen correo, teléfono ni motivos internos.
 */
export async function descargarConstanciaPdf(c) {
  const [logo, qr] = await Promise.all([
    cargarLogo(),
    c.urlVerificacion
      ? QRCode.toDataURL(c.urlVerificacion, { errorCorrectionLevel: 'M', margin: 1, width: 400, color: { dark: COLOR.ink } })
      : null,
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 18
  const estado = ESTADOS[c.estado]
  const estadoColor = COLOR[c.estado] ?? COLOR.muted

  doc.setProperties({
    title: `Certificado ${c.numeroCertificado}`,
    subject: 'Constancia de certificado de formación en trabajo en alturas',
    author: NOMBRE_SISTEMA,
    creator: NOMBRE_SISTEMA,
  })

  // Encabezado institucional
  doc.setFillColor(COLOR.primary)
  doc.rect(0, 0, W, 36, 'F')
  doc.setFillColor(COLOR.accent)
  doc.rect(0, 36, W, 1.6, 'F')
  let textX = M
  if (logo) {
    const logoH = 26
    const logoW = logoH * logo.ratio
    const pad = 1.2
    doc.setFillColor('#FFFFFF')
    doc.roundedRect(M - pad, 5 - pad, logoW + 2 * pad, logoH + 2 * pad, 1.5, 1.5, 'F')
    doc.addImage(logo.data, 'PNG', M, 5, logoW, logoH)
    textX = M + logoW + 7
  }
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setCharSpace(1.2)
  doc.text('CERTIFICADOS', textX, 14)
  doc.setCharSpace(0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(NOMBRE_EMPRESA, textX, 24)

  // Título
  let y = 52
  doc.setTextColor(COLOR.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('CONSTANCIA DE CERTIFICADO', M, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(COLOR.muted)
  doc.text('Formación en trabajo en alturas - Resolución 4272 de 2021', M, y)

  // Estado
  y += 8
  doc.setFillColor(estadoColor)
  doc.roundedRect(M, y, W - 2 * M, 14, 2, 2, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`ESTADO: ${pdfText(estado?.label ?? c.estado).toUpperCase()}`, M + 5, y + 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Verificado el ${pdfText(formatDateTime(c.generadoEn))}`, W - M - 5, y + 9, { align: 'right' })

  // Datos del certificado
  y += 24
  const qrSize = 48
  const dataWidth = W - 2 * M - qrSize - 10
  const rows = [
    ['Nombre', c.nombreCompleto],
    ['Documento', `${c.tipoDocumento ?? ''} ${c.documentoEnmascarado ?? ''}`.trim()],
    ['Programa', c.curso],
    ['Nivel', c.nivel ?? c.tipoActividad],
    ['Tipo de formación', c.tipoActividad],
    ['Intensidad horaria', c.intensidadHoraria ? `${c.intensidadHoraria} horas` : null],
    ['Número de certificado', c.numeroCertificado],
    ['Fecha de expedición', formatDate(c.fechaExpedicion)],
    ['Fecha de vencimiento', formatDate(c.fechaVencimiento)],
    ['Centro de formación', c.centroFormacion],
  ]

  const dataTop = y
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(COLOR.muted)
    doc.text(pdfText(label).toUpperCase(), M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(COLOR.ink)
    const lines = doc.splitTextToSize(pdfText(value), dataWidth)
    doc.text(lines, M, y + 5.5)
    y += 5.5 + lines.length * 5 + 4
    doc.setDrawColor(COLOR.line)
    doc.setLineWidth(0.2)
    doc.line(M, y - 3, M + dataWidth, y - 3)
  }

  // QR de verificación
  const qrX = W - M - qrSize
  if (qr) {
    doc.setDrawColor(COLOR.line)
    doc.setLineWidth(0.3)
    doc.roundedRect(qrX - 3, dataTop - 5, qrSize + 6, qrSize + 26, 2, 2, 'S')
    doc.addImage(qr, 'PNG', qrX, dataTop - 2, qrSize, qrSize)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(COLOR.muted)
    doc.text('CÓDIGO DE VERIFICACIÓN', qrX + qrSize / 2, dataTop + qrSize + 5, { align: 'center' })
    doc.setFont('courier', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(COLOR.ink)
    doc.text(pdfText(c.codigoVerificacion), qrX + qrSize / 2, dataTop + qrSize + 11, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(COLOR.muted)
    doc.text('Escanee para verificar', qrX + qrSize / 2, dataTop + qrSize + 16, { align: 'center' })
  }

  // Marca de agua cuando el certificado no está vigente
  if (c.estado !== 'VIGENTE') {
    doc.saveGraphicsState()
    doc.setGState(new doc.GState({ opacity: 0.12 }))
    doc.setTextColor(estadoColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(64)
    doc.text('NO VIGENTE', W / 2, H / 2 + 10, { align: 'center', angle: 35 })
    doc.restoreGraphicsState()
  }

  // Pie de página
  const footerTop = H - 38
  doc.setFillColor(COLOR.surface)
  doc.rect(0, footerTop, W, 38, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(COLOR.muted)
  const nota = doc.splitTextToSize(
    `Esta constancia refleja la información registrada en ${NOMBRE_SISTEMA} en la fecha y hora de verificación. ` +
      'Su validez debe confirmarse escaneando el código QR o ingresando el código de verificación en la consulta pública. ' +
      'Por protección de datos personales, el número de documento se muestra parcialmente.',
    W - 2 * M,
  )
  doc.text(nota, M, footerTop + 9)
  if (c.urlVerificacion) {
    doc.setTextColor(COLOR.primary)
    doc.textWithLink(pdfText(c.urlVerificacion), M, footerTop + 9 + nota.length * 4 + 3, { url: c.urlVerificacion })
  }

  doc.save(`Certificado-${pdfText(c.numeroCertificado)}.pdf`)
}
