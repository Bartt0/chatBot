// Extractos informativos anonimizados; su procedencia y actualización se describen en README.md.
export const exampleModules = {
  catalogo: {
    title: "Catálogo químico",
    description: "Ejemplos de líneas y presentaciones para consulta comercial.",
    items: [
      {
        title: "Cloro concentrado",
        details: [
          ["Presentaciones de ejemplo", "Botella de 1 L, galón de 3.785 L, porrón de 20 L y tambor de 200 L."],
          ["Información técnica", "Contiene hipoclorito de sodio. Confirma la concentración y la ficha técnica vigente antes de utilizarlo."]
        ],
        query: "Consulta las presentaciones de cloro concentrado y su ficha técnica."
      },
      {
        title: "Cloro industrial",
        details: [
          ["Presentaciones de ejemplo", "Porrón de 20 L y tambor de 200 L."],
          ["Información técnica", "Producto a base de hipoclorito de sodio; consulta la ficha técnica para su manejo."]
        ],
        query: "Consulta las presentaciones y ficha técnica del cloro industrial."
      },
      {
        title: "Otras líneas institucionales",
        details: [
          ["Productos de ejemplo", "Desinfectante de pino, desengrasante alcalino, jabón antibacterial y sanitizante."],
          ["Disponibilidad", "Las presentaciones y existencias deben confirmarse con la sucursal."]
        ],
        query: "Consulta las líneas institucionales de limpieza y sus presentaciones."
      }
    ]
  },
  rutas: {
    title: "Sucursales y rutas",
    description: "Cobertura y tiempos de referencia tomados de ejemplos logísticos.",
    items: [
      { title: "Guadalajara", details: [["Cobertura", "Centro de distribución y zona metropolitana."], ["Entrega de ejemplo", "24 horas hábiles, sujeta a condiciones operativas."]], query: "Consulta de rutas, horarios y tiempos de entrega para la sucursal Guadalajara" },
      { title: "Zapopan", details: [["Cobertura", "Zona metropolitana de Guadalajara."], ["Entrega de ejemplo", "24 horas hábiles, sujeta a condiciones operativas."]], query: "Consulta de rutas, horarios y tiempos de entrega para la sucursal Zapopan" },
      { title: "León", details: [["Cobertura", "Corredor del Bajío."], ["Entrega de ejemplo", "24 a 48 horas hábiles, sujeta a condiciones operativas."]], query: "Consulta de rutas, horarios y tiempos de entrega para la sucursal León" },
      { title: "Querétaro", details: [["Cobertura", "Ruta de consolidación foránea."], ["Entrega de ejemplo", "48 horas hábiles, sujeta a calendario y condiciones operativas."]], query: "Consulta de rutas, horarios y tiempos de entrega para la sucursal Querétaro" },
      { title: "Aguascalientes", details: [["Cobertura", "Ruta de consolidación foránea."], ["Entrega de ejemplo", "48 horas hábiles, sujeta a calendario y condiciones operativas."]], query: "Consulta de rutas, horarios y tiempos de entrega para la sucursal Aguascalientes" }
    ]
  },
  facturacion: {
    title: "Facturación y CFDI",
    description: "Referencia informativa sobre conciliación fiscal, sin datos de comprobantes reales.",
    items: [
      {
        title: "Validación de CFDI 4.0",
        details: [["Revisión", "Verificar los datos del comprobante y su folio fiscal UUID con Cuentas por Pagar."], ["Alcance", "Este ejemplo no valida comprobantes ni sustituye una revisión fiscal."]],
        query: "Consulta los requisitos de CFDI 4.0 y la validación del UUID con Cuentas por Pagar."
      },
      {
        title: "Refacturación y conciliación",
        details: [["Gestión", "Las discrepancias deben revisarse con el área responsable antes de solicitar una corrección."], ["Referencia", "Consulta los procedimientos vigentes y la documentación necesaria."]],
        query: "Consulta el proceso de refacturación y conciliación fiscal."
      }
    ]
  },
  devoluciones: {
    title: "Devoluciones y procedimientos",
    description: "Ejemplos de documentación y revisión para reclamaciones y envases.",
    items: [
      {
        title: "Reclamaciones y garantías",
        details: [["Reporte de ejemplo", "El procedimiento de referencia menciona una ventana de 48 horas hábiles después de la recepción."], ["Expediente", "Se contempla remisión, evidencia fotográfica y referencia al comprobante fiscal. Confirma los requisitos vigentes."]],
        query: "Consulta los requisitos y plazos vigentes para devoluciones, reclamaciones y garantías."
      },
      {
        title: "Tambores y envases",
        details: [["Revisión", "La condición del sello y del envase forma parte de la inspección."], ["Importante", "La aceptación depende de la evaluación y política vigente de la sucursal."]],
        query: "Consulta la política de devolución de tambores, porrones y envases retornables."
      }
    ]
  },
  clientes: {
    title: "Clientes",
    description: "Segmentos de ejemplo, sin nombres, contactos ni condiciones comerciales.",
    items: [
      { title: "Salud y alta especialidad", details: [["Segmento", "Instituciones que requieren productos de higiene y limpieza."], ["Información", "Las condiciones comerciales se confirman por los canales autorizados."]], query: "Consulta información general sobre atención a clientes del sector salud." },
      { title: "Hospitalidad y turismo", details: [["Segmento", "Organizaciones que utilizan productos de limpieza institucional."], ["Información", "Consulta con el área comercial las opciones disponibles."]], query: "Consulta información general sobre atención al sector hospitalidad." },
      { title: "Manufactura", details: [["Segmento", "Operaciones industriales con necesidades de limpieza y suministro."], ["Información", "Las necesidades se revisan de acuerdo con cada operación."]], query: "Consulta información general sobre atención a clientes de manufactura." }
    ]
  },
  proveedores: {
    title: "Proveedores",
    description: "Categorías de ejemplo, sin razones sociales, contactos ni condiciones negociadas.",
    items: [
      { title: "Materias primas", details: [["Categoría", "Insumos y reactivos químicos para formulación."], ["Validación", "La homologación y documentación deben confirmarse con el área responsable."]], query: "Consulta el proceso general de homologación de proveedores de materias primas." },
      { title: "Empaques y contenedores", details: [["Categoría", "Envases, empaques primarios y contenedores."], ["Validación", "Las especificaciones y condiciones se revisan con el área responsable."]], query: "Consulta los requisitos generales para proveedores de envases y contenedores." }
    ]
  }
};
