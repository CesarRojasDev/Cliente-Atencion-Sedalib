/* eslint-disable no-undef */
import { useDispatch, useSelector } from 'react-redux'
import {
  clearErrorMessage,
  onChecking,
  onLogin,
  onLogout
} from '../store'
import { atencionApi } from '../api'
import { toast } from 'react-toastify'
export const useAuthStore = () => {
  const { status, user, errorMessage } = useSelector((state) => state.auth)

  const dispatch = useDispatch()

  const startLogin = async ({ email, password }) => {
    dispatch(onChecking())
    try {
      const { data } = await atencionApi.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('token-init-date', new Date().getTime())
      dispatch(onLogin({ ...data.usuario }))
    } catch (error) {
      dispatch(onLogout('Credenciales incorrectas'))
      toast.error('Ocurrio un error!', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })
      setTimeout(() => {
        dispatch(clearErrorMessage())
      }, 10)
    }
  }

  const checkAuthToken = async () => {
    const token = localStorage.getItem('token')
    if (!token) return dispatch(onLogout())

    try {
      const { data } = await atencionApi.get('auth/renew')
      localStorage.setItem('token', data.token)
      localStorage.setItem('token-init-date', new Date().getTime())
      dispatch(onLogin({ ...data.usuario }))
    } catch (error) {
      localStorage.clear()
      dispatch(onLogout())
    }
  }

  const startLogout = () => {
    localStorage.clear()
    dispatch(onLogout())
  }
  return {
    //* Propiedades
    errorMessage,
    status,
    user,
    //* Metodos
    checkAuthToken,
    startLogin,
    startLogout
  }
}
