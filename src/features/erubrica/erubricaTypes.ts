import type * as DocumentPicker from 'expo-document-picker';

export type ERubricaTab =
  | 'inicio'
  | 'solicitudes'
  | 'documentos-por-firmar'
  | 'historial-documentos'
  | 'validar-firma'
  | 'firmar'
  | 'validar'
  | 'nueva-solicitud'
  | 'historial-solicitudes'
  | 'plan-disponible'
  | 'firma-config'
  | 'renovacion'
  | 'proveedor'
  | 'catalogos'
  | 'soporte';

export type SolicitudDocumentoKey =
  | 'cedulaFrontal'
  | 'cedulaPosterior'
  | 'selfieCedula'
  | 'videoAceptacion'
  | 'rucFile'
  | 'nombramiento'
  | 'constitucion'
  | 'cedulaRepresentante'
  | 'autorizacion'
  | 'aceptacionNombramiento'
  | 'archivoAdicional';

export const getERubricaTabTitle = (tab: ERubricaTab) => {
  const titles: Record<ERubricaTab, string> = {
    inicio: 'Inicio', solicitudes: 'Solicitudes', 'documentos-por-firmar': 'Documentos por firmar',
    'historial-documentos': 'Historial documentos', 'validar-firma': 'Validar firma', firmar: 'Firmar PDF', validar: 'Validar documento',
    'nueva-solicitud': 'Solicitar firma', 'historial-solicitudes': 'Historial de solicitudes',
    'plan-disponible': 'Plan disponible', 'firma-config': 'Configurar firma', renovacion: 'Renovación', proveedor: 'Proveedor',
    catalogos: 'Catálogos', soporte: 'Soporte',
  };
  return titles[tab];
};

export const SOLICITUD_FORM_INITIAL = {
  tipoDocumento: '', identificacion: '', codigoDactilar: '', poseeRuc: false, ruc: '', nombres: '', primerApellido: '', segundoApellido: '',
  fechaNacimiento: '', sexo: '', nacionalidad: 'ECUATORIANA', celular: '', correo: '', telefonoSecundario: '',
  correoSecundario: '', provincia: '', canton: '', direccion: '', razonSocialEmpresa: '', departamento: '', cargo: '',
  motivoFirma: '', representanteTipoDocumento: '', representanteIdentificacion: '', representanteNombres: '', representanteApellidos: '',
};

export const SOLICITUD_FILES_INITIAL: Record<SolicitudDocumentoKey, DocumentPicker.DocumentPickerAsset | null> = {
  cedulaFrontal: null, cedulaPosterior: null, selfieCedula: null, videoAceptacion: null, rucFile: null, nombramiento: null,
  constitucion: null, cedulaRepresentante: null, autorizacion: null, aceptacionNombramiento: null, archivoAdicional: null,
};
