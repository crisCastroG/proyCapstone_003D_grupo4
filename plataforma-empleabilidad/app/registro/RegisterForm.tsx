'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

// Cada región contiene su propio arreglo de ciudades
const DATOS_CHILE = [
  {
    region: 'Región de Arica y Parinacota',
    ciudades: ['Arica', 'Putre', 'Camarones', 'General Lagos'],
  },
  {
    region: 'Región de Tarapacá',
    ciudades: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara'],
  },
  {
    region: 'Región de Antofagasta',
    ciudades: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'Taltal', 'San Pedro de Atacama'],
  },
  {
    region: 'Región de Atacama',
    ciudades: ['Copiapó', 'Vallenar', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Huasco'],
  },
  {
    region: 'Región de Coquimbo',
    ciudades: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Los Vilos', 'Salamanca'],
  },
  {
    region: 'Región de Valparaíso',
    ciudades: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón', 'San Antonio', 'Quillota', 'Los Andes', 'San Felipe'],
  },
  {
    region: 'Región Metropolitana de Santiago',
    ciudades: ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'Puente Alto', 'La Florida', 'San Bernardo', 'Quilicura', 'Pudahuel', 'Colina', 'Melipilla', 'Talagante'],
  },
  {
    region: "Región del Libertador General Bernardo O'Higgins",
    ciudades: ['Rancagua', 'Machalí', 'San Fernando', 'Rengo', 'Pichilemu', 'Santa Cruz', 'San Vicente'],
  },
  {
    region: 'Región del Maule',
    ciudades: ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Molina', 'Parral'],
  },
  {
    region: 'Región de Ñuble',
    ciudades: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quirihue', 'Yungay', 'Coihueco'],
  },
  {
    region: 'Región del Biobío',
    ciudades: ['Concepción', 'Talcahuano', 'Hualpén', 'Chiguayante', 'San Pedro de la Paz', 'Coronel', 'Lota', 'Tomé', 'Penco', 'Los Ángeles', 'Lebu', 'Arauco', 'Cañete'],
  },
  {
    region: 'Región de La Araucanía',
    ciudades: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol', 'Victoria', 'Lautaro'],
  },
  {
    region: 'Región de Los Ríos',
    ciudades: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Los Lagos', 'Paillaco'],
  },
  {
    region: 'Región de Los Lagos',
    ciudades: ['Puerto Montt', 'Osorno', 'Puerto Varas', 'Castro', 'Ancud', 'Quellón', 'Frutillar'],
  },
  {
    region: 'Región de Aysén del General Carlos Ibáñez del Campo',
    ciudades: ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
  },
  {
    region: 'Región de Magallanes y de la Antártica Chilena',
    ciudades: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos'],
  },
];


function autoFormatearRun(valor: string): string {
  // Quitamos todo lo que no sea número o letra K
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo}-${dv}`;
}


function esRunChilenoValido(run: string): boolean {
  const limpio = run.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 8 || limpio.length > 9) return false;
  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dvIngresado === dvCalculado;
}

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    run: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    telefono: '',
    correo: '',
    profesion_nombre: '',
    area_nombre: '',
    region_nombre: '',
    ciudad_nombre: '',
    password: '',
  });


  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tieneMin8 = formData.password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(formData.password);
  const tieneMinuscula = /[a-z]/.test(formData.password);
  const tieneNumero = /[0-9]/.test(formData.password);
  const runEsValido = formData.run.length >= 9 ? esRunChilenoValido(formData.run) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const runConGuion = autoFormatearRun(e.target.value);
    setFormData((prev) => ({ ...prev, run: runConGuion }));
  };

 
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombreRegionElegida = e.target.value;
    const encontrada = DATOS_CHILE.find((item) => item.region === nombreRegionElegida);

    setCiudadesDisponibles(encontrada ? encontrada.ciudades : []);
    setFormData((prev) => ({
      ...prev,
      region_nombre: nombreRegionElegida,
      ciudad_nombre: '',
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!esRunChilenoValido(formData.run)) {
      setError('Por favor ingresa un RUN chileno válido.');
      return;
    }

    if (!formData.profesion_nombre || !formData.area_nombre || !formData.region_nombre || !formData.ciudad_nombre) {
      setError('Por favor selecciona tu profesión, área de trabajo, región y ciudad.');
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
                maxLength={10}
                value={formData.run}
                onChange={handleRunChange}
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
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                <option value="">Selecciona tu profesión</option>
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
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                <option value="">Selecciona tu área de trabajo</option>
                {AREAS_LISTA.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Región y Ciudad / Comuna */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Región *</label>
              <select
                name="region_nombre"
                required
                value={formData.region_nombre}
                onChange={handleRegionChange}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                <option value="">Selecciona tu región</option>
                {DATOS_CHILE.map((item) => (
                  <option key={item.region} value={item.region}>
                    {item.region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Ciudad / Comuna *</label>
              <select
                name="ciudad_nombre"
                required
                value={formData.ciudad_nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
              >
                <option value="">Selecciona tu ciudad</option>
                {ciudadesDisponibles.map((ciudad) => (
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