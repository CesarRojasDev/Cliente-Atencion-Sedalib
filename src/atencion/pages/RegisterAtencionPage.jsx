import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useAtencionStore, useAttentionValidationSchema } from '../../hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { FormLayout } from '../layout/FormLayout'
import { yupResolver } from '@hookform/resolvers/yup'
export const RegisterAtencionPage = () => {
  const [atencionCode, setAtencionCode] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  const validationSchema = useAttentionValidationSchema()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    // watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(validationSchema) })
  const { startSavingAtencion, getAtencion } = useAtencionStore()
  const { user } = useSelector((state) => state.auth)
  const id_usuario = user.id_usuario
  const usedCodes = new Set()

  const { id } = useParams()
  const navigate = useNavigate()

  const categories = {
    AGUA: {
      subcategories: [
        'FUGA EN LA CAJA',
        'FUGA EN LA CAJA POR ROBO DE MEDIDOR',
        'FUGA EN VEREDA',
        'FUGA EN PISTA',
        'FUGA EN SARDINEL',
        'ROTURA EN RED MATRIZ',
        'MANTENIENTO DE VALVULA',
        'SONDEO EN TOMA',
        'SONDEO EN LA CAJA',
        'REPARACION DE CAJA DE REGISTRO DE AGUA',
        'MARCO Y TAPA EN CAJA DE AGUA'
      ],
      problems: [
        'FUGA EN CONEXIÓN DOMICILIARIA',
        'FUGA AGUA VEREDA CALZADA(2,3,4”)',
        'ADECUACION'
      ]
    },
    DESAGUE: {
      subcategories: [
        'TAPA DE BUZON',
        'ATORO EN CAJA',
        'ATORO EN COLECTOR',
        'MARCO Y TAPA DE CAJA DESAGUE',
        'REPARACION DE CAJA DE REGISTRO DE DESAGUE',
        'HUNDIMIENTO CENTRO DE LA PISTA (desagüe)',
        'REPARACION DE COLECTOR',
        'REPARACIONES DE CONEXION',
        'ROTURA DE TUBERIA DE DESAGUE'
      ],
      problems: [
        'BUZÓN ABIERTO MÁS DE 24 HORAS ALCANTARILLADO',
        'ATORO EN CONEXIÓN ALCANTARILLADO',
        'TAPONAMIENTO EN LA CONEXIÓN',
        'ADECUACION',
        'TAPONAMIENTO DE CONEXIÓN ZONA'
      ]
    },
    'SIN SERVICIO DE AGUA': {
      subcategories: [
        'FALTA DE AGUA (DE ALCANCE GENERAL)',
        'BAJA PRESION (DE ALCANCE GENERAL)',
        'FALTA DE AGUA (DE ALCANCE PARTICULAR)',
        'BAJA PRESION (DE ALCANCE PARTICULAR'
      ],
      problems: [
        'NO CUMPLIR CON EL HORARIO ABASTECIMIENTO INJUSTIFICADO',
        'FALTA DE AGUA O BAJA PRESIÓN EN CONEXIÓN DOMICILIARIA'
      ]
    },
    CONSULTAS: {
      subcategories: [
        'REQUISITOS',
        'CUENTA CORRIENTE',
        'CENTRO DE ATENCIÓN/HORARIOS',
        'REITERA/OTROS'
      ],
      problems: ['COMERCIAL']
    }
  }
  const [atencionData, setAtencionData] = useState(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    const fetchAtencion = async () => {
      const data = await getAtencion(id)
      setAtencionData(data)
    }

    if (id) {
      fetchAtencion()
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [id, getAtencion])

  useEffect(() => {
    if (atencionData && !isDataLoaded) {
      for (const field in atencionData) {
        if (field === 'fecha') {
          setValue(
            field,
            new Date(atencionData[field]).toISOString().slice(0, 10)
          )
        } else {
          setValue(field, atencionData[field])
        }
      }
      setSelectedCategory(atencionData.categoria)
      setSelectedSubcategory(atencionData.sub_categoria)
      setIsDataLoaded(true)
    }
  }, [atencionData, setValue, isDataLoaded])

  // const category = watch('categoria')
  // const subcategory = watch('sub_categoria')
  // const modalidad = watch('modalidad')
  // useEffect(() => {
  //   const fetchAtencion = async () => {
  //     const atencionData = await getAtencion(id)
  //     for (const field in atencionData) {
  //       if (field === 'fecha') {
  //         setValue(
  //           field,
  //           new Date(atencionData[field]).toISOString().slice(0, 10)
  //         )
  //       } else {
  //         setValue(field, atencionData[field])
  //       }
  //     }
  //     // Establecer el valor de los campos select
  //     setValue('departamento', atencionData.departamento)
  //     setValue('provincia', atencionData.provincia)
  //     setValue('distrito', atencionData.distrito)
  //     setValue('categoria', atencionData.categoria)
  //     setValue('sub_categoria', atencionData.sub_categoria)
  //     setValue('problema', atencionData.problema)
  //     setValue('numero_atencion', atencionData.numero_atencion)
  //     setValue('modalidad', atencionData.modalidad)

  //     setSelectedCategory(atencionData.categoria)
  //     setSelectedSubcategory(atencionData.sub_categoria)
  //   }

  //   if (id) {
  //     fetchAtencion()
  //     setIsEditing(true)
  //   } else {
  //     setIsEditing(false)
  //   }
  // }, [id, getAtencion])

  const generateAtencion = (event) => {
    event.preventDefault()
    let code
    do {
      const randomNumber = Math.floor(Math.random() * 9000000) + 1000000
      code = '5017' + randomNumber.toString()
    } while (usedCodes.has(code))

    usedCodes.add(code)
    setAtencionCode(code)
  }

  useEffect(() => {
    setValue('numero_atencion', atencionCode)
  }, [atencionCode, setValue])

  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  const onSubmit = async (data) => {
    const newData = {
      ...data,
      id_usuario
    }

    try {
      if (isEditing) {
        await startSavingAtencion(newData)
        reset()
        navigate('/listar')
      } else {
        console.log(newData)
        await startSavingAtencion(newData)
        reset()
        navigate('/listar')
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='p-4'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex align-center justify-center items-center'>
          <h2 className='text-2xl mb-4'>
            {' '}
            {isEditing ? 'Editar Atención' : 'Registrar Atención'}
          </h2>
        </div>
        <div className='flex flex-row flex-wrap sm:flex-nowrap gap-x-8 mt-8'>
          <FormLayout title='Datos del usuario'>
            <input
              type='number'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Codigo de suministro'
              {...register('codigo_suministro', { required: true })}
            />
            {errors.codigo_suministro && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.codigo_suministro.message}</div>
              </div>
            )}
            <input
              type='text'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Nombre del usuario'
              {...register('nombre_cliente', { required: true })}
            />
            {errors.nombre_cliente && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.nombre_cliente.message}</div>
              </div>
            )}
            <input
              type='number'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Documento de Identidad'
              {...register('doc_identidad', { required: true })}
            />
            {errors.doc_identidad && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.doc_identidad.message}</div>
              </div>
            )}
            <input
              type='tel'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Celular'
              {...register('celular', { required: true })}
            />
            {errors.celular && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.celular.message}</div>
              </div>
            )}
            <input
              type='email'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Correo'
              {...register('email')}
            />
          </FormLayout>
          <FormLayout title='Datos de la atención'>
            <select
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              {...register('modalidad', { required: true })}
              defaultValue='Seleccione una modalidad'
            >
              <option value='Seleccione una modalidad' disabled>
                SELECCIONE UNA OPCIÓN
              </option>
              <option value='CORREO ELECTRONICO'>CORREO ELECTRONICO</option>
              <option value='FACEBOOK'>FACEBOOK</option>
              <option value='PRESENCIAL'>PRESENCIAL</option>
              <option value='TELEFONO'>TELEFONO</option>
              <option value='WEB'>WEB</option>
              <option value='WHATSAPP'>WHATSAPP</option>
            </select>
            {errors.modalidad && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.modalidad.message}</div>
              </div>
            )}
            <label>Categoria</label>
            <select
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              {...register('categoria', { required: true })}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedSubcategory('')
                setValue('sub_categoria', '')
                setValue('problema', '')
              }}
            >
              <option value=''>Seleccione una categoría</option>
              {Object.keys(categories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {(isEditing || selectedCategory) &&
              categories[selectedCategory] && (
                <>
                  <label>Sub-Categoria</label>
                  <select
                    className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
                    {...register('sub_categoria', { required: true })}
                    value={selectedSubcategory}
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value)
                      setValue('problema', '')
                    }}
                  >
                    <option value=''>Seleccione una subcategoría</option>
                    {categories[selectedCategory].subcategories.map(
                      (subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      )
                    )}
                  </select>
                </>
            )}

            {(isEditing || selectedSubcategory) &&
              categories[selectedCategory] && (
                <>
                  <label>Problema</label>
                  <select
                    className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
                    {...register('problema', { required: true })}
                    onChange={(e) => setValue('problema', e.target.value)}
                  >
                    <option value=''>Seleccione un problema</option>
                    {categories[selectedCategory].problems.map((problem) => (
                      <option key={problem} value={problem}>
                        {problem}
                      </option>
                    ))}
                  </select>
                </>
            )}
            <textarea
              type='text'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Petitorio'
              {...register('petitorio', { required: true })}
            />
            {errors.petitorio && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.petitorio.message}</div>
              </div>
            )}
            <div className='flex items-center'>
              <div className='relative flex-grow mr-4'>
                <input
                  readOnly
                  type='number'
                  className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
                  placeholder='Numero de Atencion'
                  {...register('numero_atencion', { required: true })}
                />
              </div>
              {!isEditing && (
                <button
                  type='submit'
                  onClick={generateAtencion}
                  className='block w-auto bg-breaker-bay-500 hover:bg-breaker-bay-600 active:bg-breaker-bay-700 rounded-l px-3 py-3 my-4 text-sm font-medium text-white'
                >
                  Generar Atención
                </button>
              )}
            </div>
            <label>Fecha</label>
            <input
              readOnly={!isEditing}
              type='date'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              value={localDate.toISOString().slice(0, 10)}
              placeholder='Fecha'
              {...register('fecha', { required: true })}
            />
            <button className='block w-full bg-breaker-bay-500 hover:bg-breaker-bay-600 active:bg-breaker-bay-700 rounded-l px-5 py-3 my-4 text-sm font-medium text-white'>
              {isEditing ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </FormLayout>

          <FormLayout title='Datos de ubicacion '>
            <select
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              {...register('departamento', { required: true })}
              defaultValue='Seleccione un departamento'
            >
              <option value='Seleccione un departamento' disabled>
                SELECCIONE UN DEPARTAMENTO
              </option>
              <option>La Libertad</option>
            </select>
            {errors.departamento && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.departamento.message}</div>
              </div>
            )}
            <select
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              {...register('provincia', { required: true })}
              defaultValue='Seleccione una provincia'
            >
              <option value='Seleccione una provincia' disabled>
                SELECCIONE UNA PROVINCIA
              </option>
              <option>Trujillo</option>
            </select>
            {errors.provincia && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.provincia.message}</div>
              </div>
            )}
            <select
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              {...register('distrito', { required: true })}
              defaultValue='Seleccione un distrito'
            >
              <option value='Seleccione un distrito' disabled>
                SELECCIONE UNA DISTRITO
              </option>
              <option>El Porvenir</option>
              <option>Florencia de Mora</option>
              <option>Huanchaco</option>
              <option>La Esperanza</option>
              <option>Laredo</option>
              <option>Moche</option>
              <option>Poroto</option>
              <option>Salaverry</option>
              <option>Simbal</option>
              <option>Trujillo</option>
              <option>Victor Larco Herrera</option>
            </select>
            {errors.distrito && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.distrito.message}</div>
              </div>
            )}
            <input
              type='text'
              className='w-full border rounded-lg text-gray-700 p-4 my-4 pe-12 text-sm shadow-sm'
              placeholder='Direccion del suministro'
              {...register('direccion', { required: true })}
            />
            {errors.direccion && (
              <div
                className='flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700'
                role='alert'
              >
                <svg
                  className='w-5 h-5 inline mr-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                <div>{errors.direccion.message}</div>
              </div>
            )}
          </FormLayout>
        </div>
      </form>
    </div>
  )
}
