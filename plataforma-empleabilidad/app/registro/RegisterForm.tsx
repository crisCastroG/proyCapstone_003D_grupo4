'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatearRut, validarRutChileno } from '@/lib/validators';

const PROFESIONES_LISTA = [
  'Ingeniero/a Civil Informático/a',
  'Ingeniero/a Comercial',
  'Contador/a Auditor/a',
  'Psicólogo/a',
  'Abogado/a',
  'Diseñador/a Gráfico/a',
  'Enfermero/a',
  'Arquitecto/a',
  'Periodista / Comunicador/a Digital',
  'Administrador/a de Empresas',
  'Ingeniero/a Industrial',
  'Médico/a Cirujano/a',
  'Profesor/a / Docente',
  'Trabajador/a Social',
  'Kinesiólogo/a',
  'Publicista / Especialista en Marketing',
  'Nutricionista',
  'Científico/a / Analista de Datos',
  'Terapeuta Ocupacional',
  'Administrador/a Gastronómico/a',
];

const AREAS_LISTA = [
  'Tecnología de la Información y Desarrollo de Software',
  'Recursos Humanos y Gestión del Talento',
  'Finanzas, Contabilidad y Auditoría',
  'Marketing, Publicidad y Crecimiento (Growth)',
  'Ventas y Desarrollo de Negocios',
  'Operaciones y Logística',
  'Salud y Servicios Sanitarios',
  'Educación, Formación y EdTech',
  'Legal, Asuntos Corporativos y Compliance',
  'Administración General y Gestión Operativa',
  'Servicio al Cliente y Experiencia del Usuario (CX)',
  'Diseño, UX/UI y Creatividad Digital',
  'Minería, Energía y Recursos Naturales',
  'Construcción e Ingeniería Civil',
  'Consultoría Estratégica y de Negocios',
  'Comunicaciones, PR y Medios',
  'Compras, Abastecimiento y Supply Chain',
  'Innovación y Transformación Digital',
  'Medio Ambiente, Sustentabilidad y ESG',
  'Sector Público y Políticas Públicas',
];

const REGIONES_Y_CIUDADES: Record<string, string[]> = {
  'Región de Arica y Parinacota': ['Arica', 'Putre', 'Camarones', 'General Lagos'],
  'Región de Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara'],
  'Región de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'Taltal', 'San Pedro de Atacama'],
  'Región de Atacama': ['Copiapó', 'Vallenar', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Huasco'],
  'Región de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Los Vilos', 'Salamanca'],
  'Región de Valparaíso': [
    'Valparaíso',
    'Viña del Mar',
    'Quilpué',
    'Villa Alemana',
    'Concón',
    'San Antonio',
    'Quillota',
    'Los Andes',
    'San Felipe',
    'La Ligua',
    'Limache',
  ],
  'Región Metropolitana de Santiago': [
    'Santiago',
    'Providencia',
    'Las Condes',
    'Ñuñoa',
    'Maipú',
    'Puente Alto',
    'La Florida',
    'San Bernardo',
    'Vitacura',
    'Lo Barnechea',
    'Peñalolén',
    'Macul',
    'San Miguel',
    'Estación Central',
    'Quilicura',
    'Pudahuel',
    'Recoleta',
    'Independencia',
    'Colina',
    'Melipilla',
    'Talagante',
    'Buin',
    'Paine',
  ],
  "Región del Libertador General Bernardo O'Higgins": [
    'Rancagua',
    'Machalí',
    'San Fernando',
    'Rengo',
    'Pichilemu',
    'Santa Cruz',
    'San Vicente',
    'Graneros',
  ],
  'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Molina', 'Parral', 'San Javier'],
  'Región de Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quirihue', 'Yungay', 'Coihueco'],
  'Región del Biobío': [
    'Concepción',
    'Talcahuano',
    'Chiguayante',
    'San Pedro de la Paz',
    'Hualpén',
    'Coronel',
    'Lota',
    'Tomé',
    'Penco',
    'Santa Juana',
    'Hualqui',
    'Los Ángeles',
    'Cabrero',
    'Nacimiento',
    'Mulchén',
    'Lebu',
    'Arauco',
    'Curanilahue',
    'Cañete',
  ],
  'Región de La Araucanía': [
    'Temuco',
    'Padre Las Casas',
    'Villarrica',
    'Pucón',
    'Angol',
    'Victoria',
    'Lautaro',
    'Nueva Imperial',
  ],
  'Región de Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Los Lagos', 'Paillaco', 'Mariquina'],
  'Región de Los Lagos': [
    'Puerto Montt',
    'Osorno',
    'Puerto Varas',
    'Castro',
    'Ancud',
    'Quellón',
    'Frutillar',
    'Llanquihue',
    'Calbuco',
  ],
  'Región de Aysén del General Carlos Ibáñez del Campo': [
    'Coyhaique',
    'Puerto Aysén',
    'Chile Chico',
    'Cochrane',
    'Cisnes',
  ],
  'Región de Magallanes y de la Antártica Chilena': [
    'Punta Arenas',
    'Puerto Natales',
    'Porvenir',
    'Cabo de Hornos (Puerto Williams)',
  ],
};

const LISTA_REGIONES = Object.keys(REGIONES_Y_CIUDADES);

export default function RegisterForm() {
  const router = useRouter();

  // Estados dedicados y directos para Región y Ciudad (imposible que queden bloqueados)
  const [regionActual, setRegionActual] = useState<string>('Región del Biobío');
  const [ciudadActual, setCiudadActual] = useState<string>('Concepción');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    run: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    telefono: '',
    correo: '',
    profesion_nombre: PROFESIONES_LISTA[0],
    area_nombre: AREAS_LISTA[0],
    password: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const ciudadesDeLaRegion = REGIONES_Y_CIUDADES[regionActual] || [];

  const tieneMin8 = formData.password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(formData.password);
  const tieneMinuscula = /[a-z]/.test(formData.password);
  const tieneNumero = /[0-9]/.test(formData.password);
  const runEsValido = formData.run.length > 7 ? validarRutChileno(formData.run) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'run') {
      setFormData((prev) => ({ ...prev, run: formatearRut(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaRegion = e.target.value;
    setRegionActual(nuevaRegion);
    const listaCiudades = REGIONES_Y_CIUDADES[nuevaRegion] || [];
    setCiudadActual(listaCiudades[0] || '');
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validarRutChileno(formData.run)) {
      setError('Por favor ingresa un RUN chileno válido.');
      return;
    }

    if (!tieneMin8 || !tieneMayuscula || !tieneMinuscula || !tieneNumero) {
      setError('La contraseña debe cumplir todos los requisitos de seguridad.');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          region_nombre: regionActual,
          ciudad_nombre: ciudadActual,
          profesion_id_profesion: 1,
          area_de_trabajo_id_area: 1,
          ciudad_id_ciudad: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar la cuenta.');
        setCargando(false);
        return;
      }

      router.push(data.redirectUrl || '/modulos');
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor.');
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', maxWidth: '680px', width: '100%', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(13, 59, 102, 0.08)', border: '1px solid #E6F2FB' }}>
        <h1 style={{ color: '#0D3B66', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Registro de Usuario • Empleamás
        </h1>
        <p style={{ color: '#2566A8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Completa tus datos personales y laborales para acceder a tu ruta de empleabilidad.
        </p>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Nombre *</label>
              <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Apellido Paterno *</label>
              <input type="text" name="apellido_paterno" required value={formData.apellido_paterno} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Apellido Materno</label>
              <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>RUN *</label>
              <input
                type="text"
                name="run"
                required
                placeholder="11111111-3"
                maxLength={12}
                value={formData.run}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: `1px solid ${runEsValido === false ? '#EF4444' : runEsValido === true ? '#10B981' : '#CBD5E1'}`,
                }}
              />
              {runEsValido === false && <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>RUN inválido</span>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Género *</label>
              <select name="genero" required value={formData.genero} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Fecha Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Correo Electrónico *</label>
              <input type="email" name="correo" required placeholder="usuario@correo.cl" value={formData.correo} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Teléfono *</label>
              <input type="tel" name="telefono" required placeholder="9 1234 5678" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
          </div>

          {/* Profesión y Área de Trabajo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Profesión / Título *</label>
              <select
                name="profesion_nombre"
                required
                value={formData.profesion_nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
              >
                {PROFESIONES_LISTA.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Área de Trabajo *</label>
              <select
                name="area_nombre"
                required
                value={formData.area_nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
              >
                {AREAS_LISTA.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Región y Ciudad / Comuna (SIEMPRE DESBLOQUEADO Y DINÁMICO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Región *</label>
              <select
                value={regionActual}
                onChange={handleRegionChange}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                {LISTA_REGIONES.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Ciudad / Comuna *</label>
              <select
                value={ciudadActual}
                onChange={(e) => setCiudadActual(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                {ciudadesDeLaRegion.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Contraseña *</label>
            <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            <div style={{ backgroundColor: '#E6F2FB', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.8rem', color: '#0D3B66' }}>
              <strong>Reglas de contraseña:</strong>
              <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                <li style={{ color: tieneMin8 ? '#15803D' : '#64748B' }}>{tieneMin8 ? '✔' : '○'} Mínimo 8 caracteres</li>
                <li style={{ color: tieneMayuscula ? '#15803D' : '#64748B' }}>{tieneMayuscula ? '✔' : '○'} Al menos 1 mayúscula</li>
                <li style={{ color: tieneMinuscula ? '#15803D' : '#64748B' }}>{tieneMinuscula ? '✔' : '○'} Al menos 1 minúscula</li>
                <li style={{ color: tieneNumero ? '#15803D' : '#64748B' }}>{tieneNumero ? '✔' : '○'} Al menos 1 número</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              backgroundColor: '#0D3B66',
              color: '#FFFFFF',
              padding: '0.9rem',
              borderRadius: '8px',
              fontWeight: 700,
              border: 'none',
              cursor: cargando ? 'not-allowed' : 'pointer',
              marginTop: '0.4rem',
            }}
          >
            {cargando ? 'Registrando...' : 'Crear mi cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: '#475569' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/inicio_sesion" style={{ color: '#2566A8', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}